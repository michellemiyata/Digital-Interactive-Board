// main.js - Matrix Controller

document.addEventListener('DOMContentLoaded', () => {
  // Give things a tiny moment to render and get actual bounding boxes
  setTimeout(() => {
    drawMatrixPaths();
  }, 100);

  window.addEventListener('resize', drawMatrixPaths);
  
  setupModalInteractions();
});

function getCenterCoordinates(element) {
  const rect = element.getBoundingClientRect();
  const matrix = document.getElementById('matrix').getBoundingClientRect();
  
  return {
    x: rect.left + rect.width / 2 - matrix.left,
    y: rect.top + rect.height / 2 - matrix.top
  };
}

function drawMatrixPaths() {
  const svg = document.getElementById('connections');
  svg.innerHTML = ''; // Clear board
  
  const matrixRect = document.getElementById('matrix').getBoundingClientRect();
  
  // Sort and draw Conrad
  const conradNodes = Array.from(document.querySelectorAll('.node.track-conrad'));
  conradNodes.sort((a, b) => {
    return parseInt(a.style.gridColumn) - parseInt(b.style.gridColumn);
  });
  
  drawPathForNodes(svg, conradNodes, 'svg-path-conrad', 'conrad-path-id', matrixRect.height, 'conrad');

  // Sort and draw Jeremiah
  const jeremiahNodes = Array.from(document.querySelectorAll('.node.track-jeremiah'));
  jeremiahNodes.sort((a, b) => {
    return parseInt(a.style.gridColumn) - parseInt(b.style.gridColumn);
  });
  
  drawPathForNodes(svg, jeremiahNodes, 'svg-path-jeremiah', 'jeremiah-path-id', matrixRect.height, 'jeremiah');
}

function drawPathForNodes(svg, nodes, className, id, matrixHeight, trackType) {
  if (nodes.length < 2) return;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
  let d = '';
  nodes.forEach((node, index) => {
    const dot = node.querySelector('.node-dot');
    const coords = getCenterCoordinates(dot);
    
    // Draw Zig-Zag timeline
    if (index === 0) {
      d += `M ${coords.x} ${coords.y} `;
    } else {
      d += `L ${coords.x} ${coords.y} `;
    }

    // Draw Vertical Drop Line to Bottom Axis
    const dropPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dropPath.setAttribute('d', `M ${coords.x} ${coords.y} L ${coords.x} ${matrixHeight}`);
    dropPath.setAttribute('class', `svg-dropline active-${trackType}`);
    dropPath.setAttribute('data-track-drop', trackType);
    svg.appendChild(dropPath);
  });

  path.setAttribute('d', d);
  path.setAttribute('class', className);
  path.setAttribute('id', id);
  svg.appendChild(path);
}

// Interaction handling for Tracks
window.highlightTrack = function(track) {
  const allNodes = document.querySelectorAll('.node');
  const allDurationBars = document.querySelectorAll('.duration-bar');
  const allCards = document.querySelectorAll('.player-card');
  const conradPath = document.getElementById('conrad-path-id');
  const jeremiahPath = document.getElementById('jeremiah-path-id');
  const allDropLines = document.querySelectorAll('.svg-dropline');

  if (track === 'all') {
    // Reset Everything
    allNodes.forEach(n => n.classList.remove('inactive', 'active'));
    allDurationBars.forEach(b => b.classList.remove('inactive', 'active'));
    allCards.forEach(c => c.classList.remove('inactive'));
    allCards.forEach(c => c.classList.add('active-card'));
    allDropLines.forEach(l => l.style.opacity = '1');
    
    if(conradPath) conradPath.style.opacity = '1';
    if(jeremiahPath) jeremiahPath.style.opacity = '1';
    return;
  }

  // Cards state
  allCards.forEach(c => {
    if (c.id === `profile-${track}`) {
      c.classList.remove('inactive');
      c.classList.add('active-card');
    } else {
      c.classList.add('inactive');
      c.classList.remove('active-card');
    }
  });

  // Nodes & Bars state
  allNodes.forEach(nodeCheck);
  allDurationBars.forEach(nodeCheck);

  function nodeCheck(el) {
    if (el.dataset.track === track) {
      el.classList.remove('inactive');
      el.classList.add('active');
    } else {
      el.classList.add('inactive');
      el.classList.remove('active');
    }
  }

  // Paths state
  if (track === 'conrad') {
    if(conradPath) conradPath.style.opacity = '1';
    if(jeremiahPath) jeremiahPath.style.opacity = '0.05';
    allDropLines.forEach(l => { l.style.opacity = l.dataset.trackDrop === 'conrad' ? '1' : '0.05'; });
  } else if (track === 'jeremiah') {
    if(conradPath) conradPath.style.opacity = '0.05';
    if(jeremiahPath) jeremiahPath.style.opacity = '1';
    allDropLines.forEach(l => { l.style.opacity = l.dataset.trackDrop === 'jeremiah' ? '1' : '0.05'; });
  }
}

// Interaction handling for Touchpoint Modals
function setupModalInteractions() {
  const modal = document.getElementById('touchpoint-modal');
  const closeBtn = document.getElementById('modal-close');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const tagEl = document.getElementById('modal-track');
  const modalContent = document.querySelector('.modal-content');

  // Close when clicking X or outside the modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  // Open when clicking any touchpoint node
  document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('click', () => {
      // Ignore clicks on inactive nodes if we are filtering
      if (node.classList.contains('inactive')) return;

      const track = node.dataset.track;
      const title = node.dataset.title;
      const desc = node.dataset.desc;

      titleEl.innerText = title;
      descEl.innerText = desc;
      
      if (track === 'conrad') {
        tagEl.innerText = "Player 1 Perspective";
        tagEl.style.color = 'var(--conrad-color)';
        tagEl.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        modalContent.style.borderTopColor = 'var(--conrad-color)';
      } else {
        tagEl.innerText = "Player 2 Perspective";
        tagEl.style.color = 'var(--jeremiah-color)';
        tagEl.style.backgroundColor = 'rgba(234, 88, 12, 0.1)';
        modalContent.style.borderTopColor = 'var(--jeremiah-color)';
      }

      modal.classList.add('open');
    });
  });
}
