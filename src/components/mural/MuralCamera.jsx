import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useMuralStore } from '@/store/muralStore'
import * as THREE from 'three'

const DAMPING = 0.12
const MIN_ZOOM = 4
const MAX_ZOOM = 20

export default function MuralCamera() {
  const { camera, gl, invalidate } = useThree()
  const { cameraTarget, setCameraTarget } = useMuralStore()

  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const currentPos = useRef(new THREE.Vector3(0, 0, 10))
  const targetPos = useRef(new THREE.Vector3(0, 0, 10))

  const lastTouchDist = useRef(0)

  // ===== PAN (Mouse + Touch) =====
  const getPointerPos = (e) => {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: e.clientX, y: e.clientY }
  }

  const getTouchDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const onPointerDown = useCallback((e) => {
    isDragging.current = true
    if (e.touches && e.touches.length === 2) {
      lastTouchDist.current = getTouchDist(e.touches)
    } else {
      const p = getPointerPos(e)
      lastPointer.current = p
    }
    velocity.current = { x: 0, y: 0 }
    gl.domElement.style.cursor = 'grabbing'
  }, [gl])

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return

    // Pinch to Zoom
    if (e.touches && e.touches.length === 2) {
      const dist = getTouchDist(e.touches)
      if (lastTouchDist.current > 0) {
        const delta = (lastTouchDist.current - dist) * 0.05
        targetPos.current.z = THREE.MathUtils.clamp(
          targetPos.current.z + delta,
          MIN_ZOOM,
          MAX_ZOOM
        )
      }
      lastTouchDist.current = dist
      invalidate()
      return
    }

    const p = getPointerPos(e)
    const dx = p.x - lastPointer.current.x
    const dy = p.y - lastPointer.current.y
    lastPointer.current = p

    // Fator de pan baseado no zoom atual
    const panFactor = camera.position.z / 300

    velocity.current = { x: -dx * panFactor, y: dy * panFactor }
    targetPos.current.x += velocity.current.x
    targetPos.current.y += velocity.current.y

    setCameraTarget([targetPos.current.x, targetPos.current.y, targetPos.current.z])
    invalidate()
  }, [camera, setCameraTarget, invalidate])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    lastTouchDist.current = 0
    gl.domElement.style.cursor = 'grab'
  }, [gl])

  // ===== ZOOM (Scroll) =====
  const onWheel = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY * 0.01
    targetPos.current.z = THREE.MathUtils.clamp(
      targetPos.current.z + delta,
      MIN_ZOOM,
      MAX_ZOOM
    )
    invalidate()
  }, [invalidate])

  // ===== EVENT LISTENERS =====
  useEffect(() => {
    const el = gl.domElement
    el.style.cursor = 'grab'

    el.addEventListener('mousedown', onPointerDown)
    el.addEventListener('mousemove', onPointerMove)
    el.addEventListener('mouseup', onPointerUp)
    el.addEventListener('mouseleave', onPointerUp)
    el.addEventListener('touchstart', onPointerDown, { passive: true })
    el.addEventListener('touchmove', onPointerMove, { passive: true })
    el.addEventListener('touchend', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      el.removeEventListener('mousedown', onPointerDown)
      el.removeEventListener('mousemove', onPointerMove)
      el.removeEventListener('mouseup', onPointerUp)
      el.removeEventListener('mouseleave', onPointerUp)
      el.removeEventListener('touchstart', onPointerDown)
      el.removeEventListener('touchmove', onPointerMove)
      el.removeEventListener('touchend', onPointerUp)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl, onPointerDown, onPointerMove, onPointerUp, onWheel])

  // ===== SMOOTH LERP =====
  useFrame(() => {
    const lerped = currentPos.current.lerp(targetPos.current, DAMPING)
    camera.position.copy(lerped)
    camera.lookAt(lerped.x, lerped.y, 0)

    if (currentPos.current.distanceTo(targetPos.current) > 0.001) {
      invalidate()
    }
  })

  return null
}
