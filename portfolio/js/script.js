// CUSTOM CURSOR
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.top  = e.clientY + 'px';
  cursor.style.left = e.clientX + 'px';
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

// Timeline reveal
gsap.utils.toArray('.event').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0, duration: 0.8,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
});

// Projects fade-in
gsap.from('.card', {
  opacity: 0, y: 30, duration: 0.6, stagger: 0.2,
  scrollTrigger: { trigger: '.projects', start: 'top 80%' }
});

// Vision kinetic text
gsap.to('.kinetic', {
  opacity: 1, scale: 1, duration: 1.2,
  ease: 'elastic.out(1, 0.5)',
  scrollTrigger: { trigger: '.vision', start: 'top 80%' }
});

// Smooth nav scroll offset
document.querySelectorAll('.navbar a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const tgt = document.querySelector(a.getAttribute('href'));
    window.scrollTo({ top: tgt.offsetTop - 60, behavior: 'smooth' });
  });
});

// ─── D3 Force-Directed AI Network ───
;(function(){
  const width = 600, height = 400;
  const svg = d3.select('#network-canvas');
  // tooltip div
  const tooltip = d3.select('body')
    .append('div')
    .attr('class','tooltip');

  // define nodes & links
  const nodes = [
    { id: 'AI/ML',    type: 'primary', desc: 'Designing and deploying intelligent models.' },
    { id: 'Cloud',    type: 'primary', desc: 'Architecting scalable cloud solutions.' },
    { id: 'Product',  type: 'primary', desc: 'End-to-end vision & execution.' },
    { id: 'TensorFlow', type: 'skill', parent: 'AI/ML' },
    { id: 'PyTorch',    type: 'skill', parent: 'AI/ML' },
    { id: 'AWS Lambda', type: 'skill', parent: 'Cloud' },
    { id: 'Kubernetes', type: 'skill', parent: 'Cloud' },
    { id: 'SCRUM',      type: 'skill', parent: 'Product' },
    { id: 'Roadmaps',   type: 'skill', parent: 'Product' }
  ];
  const links = nodes
    .filter(d => d.type === 'skill')
    .map(d => ({ source: d.id, target: d.parent }));

  // setup simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(80))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width/2, height/2));

  // draw links
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
      .attr('class', 'link');

  // draw nodes
  const node = svg.append('g')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
      .attr('class', d => `node ${d.type}`)
      .on('mouseover', (event,d) => {
        // highlight related
        link.style('stroke-opacity', l =>
          l.source.id===d.id||l.target.id===d.id ? 1 : 0.05 );
        node.style('opacity', n =>
          n.id===d.id||n.parent===d.id||n.id===d.parent ? 1 : 0.2 );
        // tooltip for primary
        if (d.type==='primary') {
          tooltip
            .style('left', (event.pageX+10)+'px')
            .style('top',  (event.pageY+10)+'px')
            .html(d.desc)
            .transition().duration(200).style('opacity',1);
        }
      })
      .on('mousemove', event => {
        tooltip
          .style('left', (event.pageX+10)+'px')
          .style('top',  (event.pageY+10)+'px');
      })
      .on('mouseout', () => {
        link.style('stroke-opacity', 0.2);
        node.style('opacity',1);
        tooltip.transition().duration(200).style('opacity',0);
      })
      .on('click', (event,d) => {
        if (d.type==='primary') {
          // filter project cards by data-tags
          document.querySelectorAll('.card').forEach(card => {
            const tags = card.dataset.tags.split(',');
            card.style.display = tags.includes(d.id) ? 'block' : 'none';
          });
        }
      });

  node.append('circle');
  node.append('text').attr('dy', 4).text(d => d.id);

  // simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
})();
