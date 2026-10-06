import { useEffect } from 'react'

function App() {
  useEffect(() => {
    const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const $ = (selector, root = document) => root.querySelector(selector)
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
    const controller = new AbortController()
    const observers = []
    const timers = new Set()
    const frames = new Set()
    const signal = controller.signal

    const setTimer = (callback, delay) => {
      const id = setTimeout(() => {
        timers.delete(id)
        callback()
      }, delay)
      timers.add(id)
      return id
    }
    const requestFrame = (callback) => {
      const id = requestAnimationFrame((time) => {
        frames.delete(id)
        callback(time)
      })
      frames.add(id)
      return id
    }

    const escapeHTML = (text) =>
      text.replace(/[&<]/g, (character) => (character === '&' ? '&amp;' : '&lt;'))

    $$('[data-split]').forEach((element) => {
      let index = 0
      element.innerHTML = element.textContent
        .trim()
        .split(/\s+/)
        .map(
          (word) =>
            '<span class="w">' +
            [...word]
              .map(
                (character) =>
                  `<span class="ch" style="--i:${index++}">${character}</span>`,
              )
              .join('') +
            '</span>',
        )
        .join(' ')
    })

    $$('[data-ty]').forEach((element) => {
      element._t ??= element.textContent.trim()
      element.innerHTML = `<span class="gh">${escapeHTML(element._t)}</span>`
    })

    function typeText(element) {
      const text = element._t
      if (prefersReducedMotion) {
        element.textContent = text
        return
      }

      let index = 0
      const typeNextCharacter = () => {
        element.innerHTML =
          escapeHTML(text.slice(0, index)) +
          '<i class="caret"></i><span class="gh">' +
          escapeHTML(text.slice(index)) +
          '</span>'
        if (index++ < text.length) {
          setTimer(typeNextCharacter, Number(element.dataset.s) || 18)
        } else {
          setTimer(() => {
            element.textContent = text
          }, 1400)
        }
      }
      typeNextCharacter()
    }

    function countUp(element) {
      const target = Number(element.dataset.count)
      let startTime = null
      const animate = (time) => {
        startTime ??= time
        const progress = Math.min((time - startTime) / 1600, 1)
        element.textContent = Math.round(target * (1 - (1 - progress) ** 3))
        if (progress < 1) requestFrame(animate)
      }
      requestFrame(animate)
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const element = entry.target
          element.classList.add('in')
          if (element._t) typeText(element)
          if (element.dataset.count) countUp(element)
          revealObserver.unobserve(element)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    observers.push(revealObserver)

    $$('.rv, [data-split], [data-ty], .sec, [data-count]').forEach((element) =>
      revealObserver.observe(element),
    )

    const roles = [
      'Full Stack Web Developer',
      'React and Node.js Developer',
      'TypeScript and SQL Builder',
      'Business Information Systems Graduate',
    ]
    const roleElement = $('#tw')
    let roleIndex = 0
    let characterIndex = 0
    let deleting = false

    if (prefersReducedMotion) {
      roleElement.textContent = roles[0]
    } else {
      const typeRole = () => {
        const role = roles[roleIndex]
        characterIndex += deleting ? -1 : 1
        roleElement.textContent = role.slice(0, characterIndex)

        let delay = deleting ? 32 : 70
        if (!deleting && characterIndex === role.length) {
          deleting = true
          delay = 1700
        } else if (deleting && characterIndex === 0) {
          deleting = false
          roleIndex = (roleIndex + 1) % roles.length
          delay = 400
        }
        setTimer(typeRole, delay)
      }
      setTimer(typeRole, 1500)
    }

    $$('.mt').forEach((element) => {
      if (element.dataset.looped) return
      element.innerHTML += element.innerHTML
      element.dataset.looped = 'true'
    })

    const progressBar = $('#bar')
    const nav = $('nav')
    const heroContent = $('.hin')
    const timeline = $('.tl')
    const timelineLine = $('.tl-line')
    const sections = $$('main section[id]')
    const navLinks = $$('.nl a[href^="#"]')
    const parallaxElements = $$('[data-sp]')

    function updateScrollState() {
      const scrollPosition = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      progressBar.style.transform = `scaleX(${maxScroll > 0 ? scrollPosition / maxScroll : 0})`
      nav.classList.toggle('sc', scrollPosition > 40)

      if (!prefersReducedMotion) {
        heroContent.style.transform = `translateY(${scrollPosition * 0.22}px)`
        heroContent.style.opacity = Math.max(
          0,
          1 - scrollPosition / (window.innerHeight * 0.8),
        )
        parallaxElements.forEach((element) => {
          element.style.transform = `translateY(${-element.parentElement.getBoundingClientRect().top * element.dataset.sp}px)`
        })
      }

      const timelineBounds = timeline.getBoundingClientRect()
      timelineLine.style.transform = `scaleY(${Math.min(
        1,
        Math.max(
          0,
          (window.innerHeight * 0.65 - timelineBounds.top) / timelineBounds.height,
        ),
      )})`

      let currentSection = ''
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top < window.innerHeight * 0.4) {
          currentSection = section.id
        }
      })
      navLinks.forEach((link) => {
        link.classList.toggle('on', link.getAttribute('href') === `#${currentSection}`)
      })
    }

    window.addEventListener('scroll', updateScrollState, { passive: true, signal })
    updateScrollState()

    $('#mb').addEventListener(
      'click',
      () => document.body.classList.toggle('mo'),
      { signal },
    )
    navLinks.forEach((link) => {
      link.addEventListener(
        'click',
        () => document.body.classList.remove('mo'),
        { signal },
      )
    })

    const cursor = $('#cur')
    if (matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion) {
      let pointerX = 0
      let pointerY = 0
      let cursorX = 0
      let cursorY = 0

      window.addEventListener(
        'mousemove',
        (event) => {
          pointerX = event.clientX
          pointerY = event.clientY
          cursor.style.opacity = 1
          cursor.classList.toggle('big', Boolean(event.target.closest('a, button, .card')))
        },
        { signal },
      )

      const animateCursor = () => {
        cursorX += (pointerX - cursorX) * 0.16
        cursorY += (pointerY - cursorY) * 0.16
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`
        requestFrame(animateCursor)
      }
      requestFrame(animateCursor)
    }

    $$('.card').forEach((card) => {
      const content = card.firstElementChild
      card.addEventListener(
        'pointermove',
        (event) => {
          if (event.pointerType !== 'mouse') return
          const bounds = card.getBoundingClientRect()
          const x = (event.clientX - bounds.left) / bounds.width
          const y = (event.clientY - bounds.top) / bounds.height
          card.style.setProperty('--mx', `${x * 100}%`)
          card.style.setProperty('--my', `${y * 100}%`)
          if (!prefersReducedMotion) {
            content.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`
          }
        },
        { signal },
      )
      card.addEventListener(
        'pointerleave',
        () => {
          content.style.transform = ''
        },
        { signal },
      )
    })

    const canvas = $('#gl')
    const THREE = window.THREE
    let renderer
    if (THREE) {
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      } catch (error) {
        console.error('Could not initialize the hero WebGL renderer.', error)
      }
    }

    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      const group = new THREE.Group();
      const material = (color, opacity, wireframe) =>
        new THREE.MeshBasicMaterial({
          color,
          wireframe: Boolean(wireframe),
          transparent: true,
          opacity,
        })
      camera.position.z = 7
      scene.add(group)

      group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), material(0x0b1530, 1)))
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.53, 1),
        material(0xff6a14, 0.9, true),
      )
      const outerWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.4, 2),
        material(0x4a78ff, 0.14, true),
      )
      group.add(wire, outerWire)

      const rings = [2.9, 3.6].map((radius, index) => {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.014, 8, 180),
          material(index ? 0x4a78ff : 0xff6a14, 0.7),
        )
        ring.rotation.set(1.2 + index * 0.6, index * 0.8, 0)
        group.add(ring)
        return ring
      })

      const particleCount = 900
      const positions = new Float32Array(particleCount * 3)
      for (let index = 0; index < positions.length; index++) {
        positions[index] = (Math.random() - 0.5) * (index % 3 === 2 ? 18 : 28)
      }
      const particleGeometry = new THREE.BufferGeometry()
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          color: 0xffa94d,
          size: 0.04,
          transparent: true,
          opacity: 0.75,
        }),
      )
      scene.add(particles)

      const resizeRenderer = () => {
        const width = canvas.clientWidth
        const height = canvas.clientHeight
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        group.position.x = width > 900 ? 3.2 : 0
        group.scale.setScalar(width > 900 ? 1 : 0.75)
      }
      resizeRenderer()
      window.addEventListener('resize', resizeRenderer, { signal })

      let mouseX = 0
      let mouseY = 0
      let scrollPosition = 0
      let visible = true
      window.addEventListener(
        'pointermove',
        (event) => {
          mouseX = event.clientX / window.innerWidth - 0.5
          mouseY = event.clientY / window.innerHeight - 0.5
        },
        { signal },
      )

      const sceneObserver = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting
      })
      sceneObserver.observe(canvas)
      observers.push(sceneObserver)

      const motionScale = prefersReducedMotion ? 0.15 : 1
      const clock = new THREE.Clock()
      const renderFrame = () => {
        if (!visible) {
          requestFrame(renderFrame)
          return
        }

        const time = clock.getElapsedTime()
        scrollPosition += (window.scrollY - scrollPosition) * 0.08
        group.rotation.y += (mouseX * 0.9 - group.rotation.y) * 0.05
        group.rotation.x +=
          (mouseY * 0.6 + scrollPosition * 0.0009 - group.rotation.x) * 0.05
        camera.position.z = 7 + scrollPosition * 0.004
        wire.rotation.y = time * 0.25 * motionScale
        wire.rotation.x = time * 0.12 * motionScale
        wire.scale.setScalar(1 + Math.sin(time * 1.5) * 0.02)
        outerWire.rotation.y = -time * 0.1 * motionScale
        rings[0].rotation.z = time * 0.3 * motionScale
        rings[1].rotation.z = -time * 0.2 * motionScale
        particles.rotation.y = time * 0.02 * motionScale + scrollPosition * 0.0004
        renderer.render(scene, camera)
        requestFrame(renderFrame)
      }
      requestFrame(renderFrame)
    }

    return () => {
      controller.abort()
      observers.forEach((observer) => observer.disconnect())
      timers.forEach(clearTimeout)
      frames.forEach(cancelAnimationFrame)
      if (renderer) {
        renderer.dispose()
      }
      document.body.classList.remove('mo')
    }
  }, [])

  return null
}

export default App
