import { DemoApiClient } from './demo-client'
import { HttpApiClient } from './http-client'

const params = new URLSearchParams(window.location.search)
const requested = params.get('mode')
if (requested === 'demo' || requested === 'api') localStorage.setItem('studentStartupCommunityMode', requested)
if (params.get('resetDemo') === '1') {
  localStorage.removeItem('studentStartupCommunityDemoData.v2')
  localStorage.removeItem('studentStartupCommunitySession.v2')
}

export const runtimeMode = localStorage.getItem('studentStartupCommunityMode') === 'api' ? 'api' : 'demo'
export const apiClient = runtimeMode === 'api' ? new HttpApiClient() : new DemoApiClient(localStorage)
