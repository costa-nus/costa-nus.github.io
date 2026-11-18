// The architecture itself is the control: click to approach, click open space to return.
(() => {
  const LANDMARKS = ['University Town', 'CDE · Engineering EA', 'Natural History Museum'];
  function CampusScene() {
    const host = React.useRef(null);
    const controller = React.useRef(null);
    const [status, setStatus] = React.useState('loading');
    const [selected, setSelected] = React.useState(-1);
    React.useEffect(() => {
      let cancelled = false;
      const observer = new IntersectionObserver(async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        try {
          const { createCampus } = await import('/site/campus-scene.js?v=15');
          await document.fonts.load('240px "Campus Display"').catch(() => []);
          if (cancelled) return;
          controller.current = createCampus(host.current, () => setStatus('fallback'), setSelected);
          setStatus('ready');
        } catch (error) {
          console.warn('Campus scene unavailable:', error);
          if (!cancelled) setStatus('fallback');
        }
      }, { rootMargin: '200px' });
      observer.observe(host.current);
      return () => { cancelled = true; observer.disconnect(); controller.current?.dispose(); controller.current = null; };
    }, []);
    return (
      <div className="campus" data-focused={selected >= 0} aria-label="Explore the NUS campus">
        <div className="campus-stage">
          <div ref={host} className="campus-canvas" hidden={status === 'fallback'} />
          {status === 'fallback' && <div className="campus-fallback"><img src="/openings/images/image1.png" alt="University Town at NUS" /></div>}
        </div>
        <span className="campus-sr-only" role="status" aria-live="polite">
          {status === 'loading' ? 'Loading campus.' : selected < 0 ? 'Campus overview. Click a building to zoom in. Keyboard: 1, 2 or 3 selects a building; Escape returns to overview.' : `${LANDMARKS[selected]}. Click open space or press Escape to return. Drag or use arrow keys to rotate.`}
        </span>
      </div>
    );
  }
  Object.assign(window, { CampusScene });
})();
