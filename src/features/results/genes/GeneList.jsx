import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Typography } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import './style.css';
import { makeStyles } from '@material-ui/core/styles';

import Slide from '@material-ui/core/Slide';

import Paper from '@material-ui/core/Paper';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import CopyToClipboardButton from '../../../components/CopyToClipboardButton'
import OpenInCytoscapeButton from '../../../components/OpenInCytoscapeButton'
import SearchInIQueryButton from '../../../components/SearchInIQueryButton'


import { getPathwaysFromNetwork } from '../../../api/ndex'
import { importNetwork } from '../../../api/cyrest'

import {
  selectElements,
} from '../network/networkSlice';

import {
  selectGenes
} from './geneSlice';

import {
  selectSelectedPathways, selectAvailablePathways
} from '../../pathway/pathwaySlice';

import {
  selectSelectedDrug
} from '../../drugs/drugSlice';

import {
  getGenes
} from '../../../api/drugcell'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    'min-height': 0,
    height: '100%',

    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    'flex-flow': 'column',
  },
  genetypography: {
    'flex-grow': 1,
    justifyContent: 'center'
  },
  geneselecthint: {
    color: '#7570B3',
    display: 'flex',
    height: '3em',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  icons: {
    display: 'flex',
    'flex-grow': 0,
    alignItems: 'center'
  },
  genepaper: {
    'flex-grow': '1',
    //'height': '100%'
  }
}));

export function GeneList() {

  const classes = useStyles();

  const genes = useSelector(selectGenes);

  const elements = useSelector(selectElements);

  const selectedPathways = useSelector(selectSelectedPathways);

  const availablePathways = useSelector(selectAvailablePathways);

  const selectedDrugUUID = useSelector(selectSelectedDrug);

  const fetchCX = () => new Promise((resolve, reject) => {

    let queryStrings = [];

    elements.filter(element => element.data['nodetype'] == 'Term').forEach(element => queryStrings.push(element.data['shared-name']));

    const pathwayIDs = selectedPathways.map(pathwayName => availablePathways[pathwayName]['shared-name']);

    Promise.all(pathwayIDs.map(pathwayId => getGenes(selectedDrugUUID, pathwayId))).then(responses =>
      Promise.all(responses.map(res => res.json()))
    ).then(jsonResponses => {

      let allGenes = [];
      jsonResponses.forEach(elements => {

        allGenes = allGenes.concat(elements);
      });

      getPathwaysFromNetwork(selectedDrugUUID, queryStrings.concat(allGenes))
        .then(response => {
          response.json().then(json =>
            resolve(json));
        }).catch(error => reject(error));
    });
  });

  const copyGenesToClipboard = () => {
    const geneText = genes.join('\n');
    var dummy = document.createElement("textarea");

    document.body.appendChild(dummy);

    dummy.value = geneText;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);

    console.log('copied');
  }

  const searchInIQuery = () => {
    const iQueryUrl = 'http://iquery.ndexbio.org/?genes=' + genes.join(",");
    window.open(iQueryUrl, '_blank');
  }

  const disabled = genes === undefined || genes === null || genes.length == 0;

  const getGeneLink = (geneName) => {
    const term = `(${geneName}[Gene Name]) AND Human[Organism]`;
    return 'https://www.ncbi.nlm.nih.gov/gene?term=' + encodeURIComponent(term);
  }

  return (
    <div className={classes.root}>
      {genes.length == 0 && elements.length != 0 ? (
        <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={1500} >
          <div className={classes.geneselecthint} >
            <Typography variant="subtitle1" className={classes.genetypography}>
              Select a Pathway from the Network to show included Genes
          </Typography>
            <ArrowForwardIcon />
          </div>
        </Slide>
      ) : (
       <div>
      <Typography variant="h6" className={classes.genetypography}>
              Genes Annotated by Selected Pathways ({genes.length})
      </Typography>
      
      <div className={classes.icons}>
        <SearchInIQueryButton onClick={searchInIQuery} disabled={disabled} />
        <OpenInCytoscapeButton fetchCX={fetchCX} />
        <CopyToClipboardButton onClick={copyGenesToClipboard} disabled={disabled} />
      </div>
    
          <Paper
          //style={{ overflow: 'auto', height: 'calc(100vh - 280px)' }}
          >
            <List component='nav' aria-label='gene list' dense={true} overflow='auto'>
              {genes.slice().sort((a, b) => a.localeCompare(b)).map(gene => {
                return (
                  <ListItem component='a' href={ getGeneLink(gene)} target='_blank'>
                    <ListItemText primary={gene} />
                  </ListItem>);
              })}
            </List>
          </Paper>
          </div>
        )}
    </div>
  );
}