import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import {
  agreementParties, agreements, auditLogs, cohortParticipants, cohorts, comments, communityMemberships,
  communities, connections, consents, contributions, conversationParticipants, conversations,
  evidenceArtifacts, jobActions, jobs, messages, organizationMemberships, organizations, outcomes,
  postActions, posts, programPartners, programs, mentorProfiles, startupMembers, startupMilestones,
  startupRoles, startups, users,
} from '../db/schema'
import { optionalAuth, publicUser, type Variables } from '../lib/platform'

export const snapshotRoutes = new Hono<{ Variables: Variables }>()
snapshotRoutes.get('/', optionalAuth, async (context) => {
  const currentUser = context.get('user')
  const [
    userRows, postRows, commentRows, actionRows, communityRows, communityMemberRows, jobRows, jobActionRows,
    conversationRows, participantRows, messageRows, connectionRows, organizationRows, membershipRows,
    agreementRows, partyRows, programRows, programPartnerRows, cohortRows, participantCohortRows,
    contributionRows, evidenceRows, outcomeRows, consentRows, auditRows,
    startupRows, startupMemberRows, startupRoleRows, startupMilestoneRows, mentorRows,
  ] = await Promise.all([
    db.select().from(users), db.select().from(posts), db.select().from(comments), db.select().from(postActions),
    db.select().from(communities), db.select().from(communityMemberships), db.select().from(jobs), db.select().from(jobActions),
    db.select().from(conversations), db.select().from(conversationParticipants), db.select().from(messages), db.select().from(connections),
    db.select().from(organizations), db.select().from(organizationMemberships), db.select().from(agreements), db.select().from(agreementParties),
    db.select().from(programs), db.select().from(programPartners), db.select().from(cohorts), db.select().from(cohortParticipants),
    db.select().from(contributions), db.select().from(evidenceArtifacts), db.select().from(outcomes), db.select().from(consents),
    db.select().from(auditLogs), db.select().from(startups), db.select().from(startupMembers),
    db.select().from(startupRoles), db.select().from(startupMilestones),
    db.select({ profile: mentorProfiles, user: users }).from(mentorProfiles).innerJoin(users, eq(mentorProfiles.userId, users.id)),
  ])
  const myActions = new Set(actionRows.filter((row) => row.userId === currentUser?.id).map((row) => `${row.kind}:${row.postId}`))
  const myCommunities = new Set(communityMemberRows.filter((row) => row.userId === currentUser?.id).map((row) => row.communityId))
  const myJobs = new Set(jobActionRows.filter((row) => row.userId === currentUser?.id).map((row) => `${row.kind}:${row.jobId}`))
  return context.json({
    version: 3,
    users: userRows.map(publicUser), passwords: {},
    posts: postRows.map((post) => ({
      ...post, commentsList: commentRows.filter((comment) => comment.postId === post.id),
      liked: myActions.has(`liked:${post.id}`), saved: myActions.has(`saved:${post.id}`),
    })),
    communities: communityRows.map((item) => ({ ...item, joined: myCommunities.has(item.id) })),
    jobs: jobRows.map((item) => ({ ...item, applied: myJobs.has(`applied:${item.id}`), saved: myJobs.has(`saved:${item.id}`) })),
    conversations: conversationRows.map((item) => ({ id: item.id, participantIds: participantRows.filter((row) => row.conversationId === item.id).map((row) => row.userId) })),
    messages: messageRows,
    connections: connectionRows.map((row) => [row.userAId, row.userBId]),
    organizations: organizationRows, orgMemberships: membershipRows, agreements: agreementRows,
    agreementParties: partyRows, programs: programRows, programPartners: programPartnerRows,
    cohorts: cohortRows, cohortParticipants: participantCohortRows, contributions: contributionRows,
    evidenceArtifacts: evidenceRows, outcomes: outcomeRows, consents: consentRows, auditLogs: auditRows,
    startups: startupRows.filter((startup) =>
      startup.status === 'active' || startup.createdBy === currentUser?.id || currentUser?.roles.includes('platform_admin')
    ).map((startup) => {
      const members = startupMemberRows.filter((member) => member.startupId === startup.id && member.status === 'active')
      const openRoles = startupRoleRows.filter((role) => role.startupId === startup.id && role.status === 'open')
      return {
        id: startup.id, slug: startup.slug, name: startup.name, sector: startup.sector, stage: startup.stage,
        score: startup.readinessScore, roles: `${openRoles.length} open role${openRoles.length === 1 ? '' : 's'}`,
        summary: startup.summary, fullDesc: startup.fullDescription, founded: startup.founded, location: startup.location,
        backedBy: [],
        team: members.map((member) => {
          const user = userRows.find((candidate) => candidate.id === member.userId)
          return { name: user?.name ?? 'Team member', title: member.title }
        }),
        milestones: startupMilestoneRows.filter((milestone) => milestone.startupId === startup.id).map((milestone) => ({
          date: milestone.dateLabel, title: milestone.title, desc: milestone.description,
          status: milestone.status as 'done' | 'current' | 'future',
        })),
        openRoles: openRoles.map((role) => ({
          title: role.title, dept: role.department, type: role.type, skills: role.skills,
        })),
      }
    }),
    mentors: mentorRows.map(({ profile, user }) => ({
      id: profile.id, userId: user.id, name: user.name, title: user.title, expertise: profile.expertise,
      company: profile.company, rating: profile.rating, sessions: profile.sessions,
      availability: profile.availability, focusStage: profile.focusStage, bio: profile.bio, status: profile.status,
    })),
    nextIds: {}, currentUser: currentUser ? publicUser(currentUser) : null,
  })
})
