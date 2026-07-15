import { useEffect, useRef } from 'react'

/**
 * ShaderBackground — premium WebGL fragment-shader backdrop for SSC.
 *
 * Full-viewport fixed canvas rendering a flowing sine-wave field in the
 * navy/emerald/gold palette with a jelly/rubber mouse interaction: moving the
 * cursor grabs the field elastically and stretches it; when the cursor stops
 * (or the button is released) the velocity decays and the field springs back.
 *
 * - WebGL1 with graceful fallback (no GL → render nothing; navy body bg shows).
 * - Works in dark and light (premium cream/emerald/gold in light).
 * - Battery-aware: pauses when the tab is hidden; static frame under
 *   prefers-reduced-motion.
 * - DPR capped at 1.5; ResizeObserver keeps the buffer synced to CSS size.
 */

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;     // normalized [0,1], y up
uniform vec2  u_mouseVel;  // normalized velocity (uv units), decays to 0
uniform float u_grab;      // grab strength: ~0.4 idle, ~1.0 while button held
uniform float u_scroll;    // normalized scroll progress [0,1]
uniform float u_dark;      // 1.0 dark, 0.0 light

// Dark palette (sRGB)
const vec3 NAVY   = vec3(0.035, 0.055, 0.105);
const vec3 NAVY2  = vec3(0.075, 0.115, 0.195);
const vec3 EMERALD= vec3(0.055, 0.715, 0.45);
const vec3 TEAL   = vec3(0.10, 0.55, 0.58);
const vec3 GOLD   = vec3(0.96, 0.78, 0.33);

void main() {
  vec2 uv = v_uv;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  vec2 p = uv - 0.5;
  p.x *= aspect;

  float t = u_time * 0.13 + u_scroll * 3.0;

  // ---- Jelly grab: displace the flow field around the cursor by mouse velocity.
  vec2 m = vec2((u_mouse.x - 0.5) * aspect, u_mouse.y - 0.5);
  float md = length(p - m);
  float grab = smoothstep(0.50, 0.0, md);                 // radial falloff
  vec2 vel = vec2(u_mouseVel.x * aspect, u_mouseVel.y);
  vec2 disp = vel * grab * (0.55 + u_grab * 0.9);         // elastic stretch
  vec2 pp = p - disp;                                     // dragged sample point

  // Layered sine/cosine flow — sampled at the dragged point (jelly).
  float n = 0.0;
  for (float i = 1.0; i < 5.0; i++) {
    n += sin(pp.x * i * 1.6 + t + pp.y * i * 0.55) * 0.18;
    n += cos(pp.y * i * 1.9 - t * 0.85 + pp.x * i * 0.35) * 0.13;
  }

  // Cursor glow + grab highlight.
  float glow = smoothstep(0.30, 0.0, md) * (0.18 + u_grab * 0.10) + grab * length(vel) * 1.6;

  float f = smoothstep(-0.45, 0.6, n + glow);

  // Dark composition
  vec3 col = mix(NAVY, NAVY2, f);
  col = mix(col, EMERALD, smoothstep(0.25, 0.95, f) * 0.55);
  col = mix(col, GOLD, pow(1.0 - uv.y, 3.5) * 0.10);
  col = mix(col, TEAL, pow(uv.y, 3.5) * 0.08);

  // Energy filaments
  float filament = smoothstep(0.05, 0.0, abs(n) * 0.5) * (0.10 + glow);
  col += EMERALD * filament * 0.5;

  // Vignette
  float vig = smoothstep(1.15, 0.25, length(p));
  col *= mix(0.55, 1.0, vig);

  // ---- Light composition: warm cream + soft emerald flow + faint gold.
  vec3 CREAM = vec3(0.975, 0.972, 0.955);
  vec3 SAGE  = vec3(0.890, 0.935, 0.855);
  vec3 light = mix(CREAM, SAGE, f * 0.45);
  light = mix(light, EMERALD, smoothstep(0.45, 0.95, f) * 0.28);          // emerald band
  light = mix(light, GOLD * 0.6 + 0.4, pow(1.0 - uv.y, 3.5) * 0.08);      // gold floor
  light += (EMERALD + 0.25) * glow * 0.22;                                // cursor glow
  light *= mix(0.93, 1.0, vig);
  col = mix(light, col, u_dark);

  gl_FragColor = vec4(col, 1.0);
}
`

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null
  return shader
}

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    if (!prog) return
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')
    const uMouseVel = gl.getUniformLocation(prog, 'u_mouseVel')
    const uGrab = gl.getUniformLocation(prog, 'u_grab')
    const uScroll = gl.getUniformLocation(prog, 'u_scroll')
    const uDark = gl.getUniformLocation(prog, 'u_dark')

    let width = 0
    let height = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.floor(window.innerWidth * dpr)
      const h = Math.floor(window.innerHeight * dpr)
      if (w !== width || h !== height) {
        width = w
        height = h
        canvas.width = w
        canvas.height = h
      }
    }
    resize()

    // Mouse state: position (normalized, y up) + smoothed velocity + grab.
    const mouse = { x: 0.5, y: 0.5 }
    const prev = { x: 0.5, y: 0.5 }
    const vel = { x: 0, y: 0 }
    let grab = 0.4
    let grabTarget = 0.4

    const onMouseMove = (event: MouseEvent) => {
      const nx = event.clientX / window.innerWidth
      const ny = 1.0 - event.clientY / window.innerHeight
      // Impulse: accumulate movement delta into velocity (uv units, y up).
      vel.x += (nx - prev.x)
      vel.y += (ny - prev.y)
      prev.x = nx
      prev.y = ny
      mouse.x = nx
      mouse.y = ny
    }
    const onMouseDown = () => { grabTarget = 1.0 }
    const onMouseUp = () => { grabTarget = 0.4 }

    let scrollNorm = 0
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      scrollNorm = max > 0 ? window.scrollY / max : 0
    }

    const isDark = () => (document.documentElement.classList.contains('dark') ? 1 : 0)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let rafId = 0
    let running = true

    const render = (time: number) => {
      // Velocity spring: decay toward 0 so the field snaps back when the mouse stops.
      const speed = Math.hypot(vel.x, vel.y)
      const capped = speed > 0.4 ? 0.4 / speed : 1
      vel.x *= capped
      vel.y *= capped
      vel.x *= 0.86
      vel.y *= 0.86
      // Grab strength easing.
      grab += (grabTarget - grab) * 0.15

      gl.viewport(0, 0, width, height)
      if (uTime) gl.uniform1f(uTime, time * 0.001)
      if (uRes) gl.uniform2f(uRes, width, height)
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y)
      if (uMouseVel) gl.uniform2f(uMouseVel, vel.x, vel.y)
      if (uGrab) gl.uniform1f(uGrab, grab)
      if (uScroll) gl.uniform1f(uScroll, scrollNorm)
      if (uDark) gl.uniform1f(uDark, isDark())
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const loop = (time: number) => {
      if (!running) return
      render(time)
      rafId = requestAnimationFrame(loop)
    }

    render(0)
    if (!reducedMotion) rafId = requestAnimationFrame(loop)

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(rafId)
      } else if (!reducedMotion) {
        running = true
        rafId = requestAnimationFrame(loop)
      }
    }

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 120)
    }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(rafId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <div aria-hidden='true' className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
      <canvas ref={canvasRef} className='size-full' style={{ display: 'block' }} />
    </div>
  )
}
