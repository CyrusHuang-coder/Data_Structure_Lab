import React from 'react';
import Renderer from '../Renderer/index.jsx';
import { classes, distance } from 'common/util';
import styles from './GraphRenderer.module.scss';

let graphInstance=0;
class GraphRenderer extends Renderer {
  constructor(props) {
    super(props);

    this.markerPrefix = `graph-${++graphInstance}-`;
    this.elementRef = React.createRef();
    this.selectedNode = null;

    this.togglePan(true);
    this.toggleZoom(true);
  }

  handleMouseDown(e) {
    super.handleMouseDown(e);
    const coords = this.computeCoords(e);
    const { nodes, dimensions } = this.props.data;
    const { nodeRadius } = dimensions;
    this.selectedNode = nodes.find(node => distance(coords, node) <= nodeRadius);
  }

  handleMouseMove(e) {
    if (this.selectedNode) {
      const { x, y } = this.computeCoords(e);
      const node = this.props.data.findNode(this.selectedNode.id);
      node.x = x;
      node.y = y;
      this.refresh();
    } else {
      super.handleMouseMove(e);
    }
  }

  computeCoords(e) {
    const svg = this.elementRef.current;
    const s = svg.createSVGPoint();
    s.x = e.clientX;
    s.y = e.clientY;
    const { x, y } = s.matrixTransform(svg.getScreenCTM().inverse());
    return { x, y };
  }

  renderData() {
    const { nodes, edges, isDirected, isWeighted, dimensions } = this.props.data;
    const { baseWidth, baseHeight, nodeRadius, arrowGap, nodeWeightGap, edgeWeightGap } = dimensions;
    const viewBox = [
      (this.centerX - baseWidth / 2) * this.zoom,
      (this.centerY - baseHeight / 2) * this.zoom,
      baseWidth * this.zoom,
      baseHeight * this.zoom,
    ];
    return (
      <svg className={styles.graph} viewBox={viewBox} ref={this.elementRef}>
        <defs>
          <marker id={this.markerPrefix+'markerArrow'} markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L0,4 L4,2 L0,0" className={styles.arrow} />
          </marker>
          <marker id={this.markerPrefix+'markerArrowSelected'} markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L0,4 L4,2 L0,0" className={classes(styles.arrow, styles.selected)} />
          </marker>
          <marker id={this.markerPrefix+'markerArrowVisited'} markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L0,4 L4,2 L0,0" className={classes(styles.arrow, styles.visited)} />
          </marker>
        </defs>
        {
          [...edges].sort((a, b) => a.visitedCount - b.visitedCount).map(edge => {
            const { source, target, weight, visitedCount, selectedCount } = edge;
            const sourceNode = this.props.data.findNode(source);
            const targetNode = this.props.data.findNode(target);
            if (!sourceNode || !targetNode) return undefined;
            const { x: sx, y: sy } = sourceNode;
            let { x: ex, y: ey } = targetNode;
            const mx = (sx + ex) / 2;
            const my = (sy + ey) / 2;
            const dx = ex - sx;
            const dy = ey - sy;
            const degree = Math.atan2(dy, dx) / Math.PI * 180;
            if (isDirected) {
              const length = Math.sqrt(dx * dx + dy * dy);
              if (length !== 0) {
                ex = sx + dx / length * (length - nodeRadius - arrowGap);
                ey = sy + dy / length * (length - nodeRadius - arrowGap);
              }
            }

            return (
              <g className={classes(styles.edge, selectedCount && styles.selected, visitedCount && styles.visited)}
                 data-edge-source={source} data-edge-target={target} data-edge-state={edge.removed?'removed':selectedCount?'selected':visitedCount?'visited':'idle'} key={`${source}-${target}`}>
                <path d={source===target?`M${sx-8},${sy-8} C${sx-70},${sy-75} ${sx+70},${sy-75} ${sx+8},${sy-8}`:`M${sx},${sy} L${ex},${ey}`} style={{strokeDasharray:edge.thread||edge.removed?'5 4':undefined,markerEnd:isDirected?`url(#${this.markerPrefix}${visitedCount?'markerArrowVisited':selectedCount?'markerArrowSelected':'markerArrow'})`:undefined}} className={classes(styles.line, isDirected && styles.directed)} />
                {
                  isWeighted &&
                  <g transform={`translate(${mx},${my})`}>
                    <text className={styles.weight} transform={`rotate(${degree})`}
                          y={-edgeWeightGap}>{this.toString(weight)}</text>
                  </g>
                }
              </g>
            );
          })
        }
        {
          nodes.map(node => {
            const { id, x, y, weight, visitedCount, selectedCount } = node;
            return (
              <g className={classes(styles.node, selectedCount && styles.selected, visitedCount && styles.visited)}
                 key={id} transform={`translate(${x},${y})`}>
                <circle className={styles.circle} r={nodeRadius} />
                <text className={styles.id}>{id}</text>
                {
                  isWeighted &&
                  <text className={styles.weight} x={nodeRadius + nodeWeightGap}>{this.toString(weight)}</text>
                }
              </g>
            );
          })
        }
      </svg>
    );
  }
}

export default GraphRenderer;
