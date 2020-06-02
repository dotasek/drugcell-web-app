import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectElements,
} from './networkSlice';

import {
  setGenesFromURLs
} from './../../genes/geneSlice'

import {
  selectSelectedDrug
} from './../drugSlice'

import './style.css';
import Cytoscape from 'cytoscape'
import Dagre from 'cytoscape-dagre';
import CytoscapeComponent from 'react-cytoscapejs';
import { Typography } from '@material-ui/core';
Cytoscape.use(Dagre);

let cyInstance = undefined;

export function Network() {

  //useEffect(() => console.log('mounted'), []);

  const elements = useSelector(selectElements);
  const drugUUID = useSelector(selectSelectedDrug);


  const style = [
    {
      'selector': 'node',
      'style': {
        'display': 'element',
        'label': 'data(label)',
        'text-max-width': 60,
        'text-wrap': 'wrap',
        'text-halign': 'center',
        'text-valign': 'top'
      }
    },
    {
      'selector': 'node[gene-count]',
      'style': {
        'text-halign': 'right',
        'text-valign': 'center',
        'text-margin-x': '8px'
      }
    },
    {
      'selector': '#5883',
      'style': {
        'display': 'element',
        'text-halign': 'left',
        'text-valign': 'center',
        'background-color': 'red',
      }
    },
    {
      'selector': 'node[nodetype="Term"]',
      'style': {
        'display': 'element',
        'width': 'mapData(rlipp, 0, 278, 20, 50)',
        'height': 'mapData(rlipp, 0, 278,  20, 50)'
      }
    },
    {
      'selector': 'edge[edgetype="Child-Parent"]',
      'style': {
        'width': 4,
        'target-arrow-shape': 'triangle',
        'line-color': '#9dbaea',
        'target-arrow-color': '#9dbaea',
        'curve-style': 'taxi',
        'taxi-direction': 'vertical',
        'taxi-turn': '100%'
      }
    }];

  const dispatch = useDispatch();



  return (
    elements.length == 0
      ? <div
        vertical-align='middle'>
        <Typography class='hint'>
          Select a Drug and Pathways
      </Typography>   </div>
      : <div class='network'>
        <CytoscapeComponent elements={JSON.parse(JSON.stringify(elements))}
          style={{ width: '100%', height: '100vh' }} layout={{
            name: 'dagre',
            rankDir: 'LR',
            rankSep: 60,
            ranker: 'longest-path',
            nodeDimensionsIncludeLabels: true,
            nodeSep: 75,
            transform: (node, position) => {
              return position;
            }
          }} stylesheet={style}
          cy={cy => {
            console.log('setting cy instance');
            cyInstance = cy;
            cyInstance.on('select', function (event) {
              try {
                let pathwayIds = [];
                cy.$(':selected').forEach(element => {
                  if (element.isNode()) {
                    const pathwayId = element.data('shared-name');
                    pathwayIds.push(pathwayId);
                  }
                });
                dispatch(setGenesFromURLs({ uuid: drugUUID, selectedPathways: pathwayIds }))
              } catch (e) {
                console.warn(e)
              }
            });

            cyInstance.on('tap', 'node', function (event) {
              try {
                let pathwayIds = [];

                if (event.target.isNode()) {
                  const pathwayId = event.target.data('shared-name');
                  pathwayIds.push(pathwayId);
                }

                dispatch(setGenesFromURLs({ uuid: drugUUID, selectedPathways: pathwayIds }))
              } catch (e) {
                console.warn(e)
              }
            })

          }} />
      </div>
  );
}
