
import { METHOD_GET } from './apiConstants'

const DRUG_CELL_PRODUCTION_URL = 'http://drugcell.ucsd.edu';
const DRUG_CELL_URL = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1' : DRUG_CELL_PRODUCTION_URL;
const DRUG_CELL_PORT = process.env.NODE_ENV === 'development' ? '8080' : '80';
const DRUG_CELL_ROOT = process.env.NODE_ENV === 'development' ? 'data' : 'oracledata'

const getURL = (path) => {
    return DRUG_CELL_URL + ':' + DRUG_CELL_PORT + '/'+ DRUG_CELL_ROOT + path;
} 

  const getDrugs = () => {
    const url = getURL('/drug-index.json');
      return fetch(url, {
      method: METHOD_GET
    })
  }

  const getPathways = (drugUUID) => {
    const url = getURL('/drugs/' + drugUUID + '/index.json');
      return fetch(url, {
      method: METHOD_GET
    })
  }

  const getPathway = (drugUUID, pathwayID) => {
    const url = getURL('/drugs/' + drugUUID + '/paths/' + pathwayIDConvert(pathwayID) + '.json');
    
      return fetch(url, {
      method: METHOD_GET,
      //mode: 'no-cors'
    })
  }

  const getGenes = (drugUUID, pathwayID)=> {
    const url = getURL('/drugs/' + drugUUID + '/genes/' + pathwayIDConvert(pathwayID) + '.json');
    
      return fetch(url, {
      method: METHOD_GET,
      //mode: 'no-cors'
    })
  }

  const pathwayIDConvert = (pathwayID) => {
    return pathwayID.replace(':', '_');
  }

  export { getDrugs , getPathways, getPathway, getGenes }