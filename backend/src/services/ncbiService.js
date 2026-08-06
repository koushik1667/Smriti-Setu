const https = require('https');
const http = require('http');

/**
 * Service to interact with NIH / NCBI Entrez & PubChem Biomedical APIs
 */
class NcbiService {
  /**
   * Helper function to perform HTTP/HTTPS GET requests
   */
  static fetchJson(url) {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'PharmaVisionAI/1.0' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(4000, () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Searches NCBI PubChem & Entrez E-utilities for drug compound details
   * @param {string} query - Medication or active ingredient name (e.g., "Ascorbic acid", "Paracetamol", "Amoxicillin")
   * @returns {Promise<Object|null>} Biomedical metadata from NCBI / NIH
   */
  static async searchDrugNCBI(query) {
    if (!query || typeof query !== 'string') return null;

    // Clean query (extract primary drug name, remove dosage numbers)
    const cleanQuery = query
      .replace(/\d+\s*(mg|g|ml|mcg|iu|cap|tab|tablets|capsules)/gi, '')
      .replace(/chewable|effervescent|extra strength|delayed-release/gi, '')
      .trim();

    if (!cleanQuery) return null;

    const ncbiApiKey = process.env.NCBI_API_KEY;
    const apiKeyParam = ncbiApiKey ? `&api_key=${encodeURIComponent(ncbiApiKey)}` : '';

    try {
      // 1. Fetch PubChem Compound Property from NCBI PUG REST API
      const pubchemPropUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(cleanQuery)}/property/Title,MolecularFormula,MolecularWeight,IUPACName/JSON${apiKeyParam ? '?' + apiKeyParam.substring(1) : ''}`;
      const propData = await NcbiService.fetchJson(pubchemPropUrl);

      let pubchemInfo = null;
      if (propData && propData.PropertyTable && propData.PropertyTable.Properties && propData.PropertyTable.Properties[0]) {
        const prop = propData.PropertyTable.Properties[0];
        pubchemInfo = {
          cid: prop.CID,
          title: prop.Title,
          molecularFormula: prop.MolecularFormula,
          molecularWeight: prop.MolecularWeight,
          iupacName: prop.IUPACName
        };
      }

      // 2. Fetch PubChem Description & Pharmacology Summary
      let description = null;
      if (pubchemInfo && pubchemInfo.cid) {
        const pubchemDescUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemInfo.cid}/description/JSON`;
        const descData = await NcbiService.fetchJson(pubchemDescUrl);
        if (descData && descData.InformationList && descData.InformationList.Information) {
          const infoItem = descData.InformationList.Information.find(item => item.Description && item.Description.length > 20);
          if (infoItem) {
            description = infoItem.Description;
          }
        }
      }

      // 3. Query NCBI Entrez E-utilities MeSH Database for Clinical Classification
      let meshId = null;
      const entrezSearchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=mesh&term=${encodeURIComponent(cleanQuery)}&retmode=json${apiKeyParam}`;
      const entrezData = await NcbiService.fetchJson(entrezSearchUrl);

      if (entrezData && entrezData.esearchresult && entrezData.esearchresult.idlist && entrezData.esearchresult.idlist.length > 0) {
        meshId = entrezData.esearchresult.idlist[0];
      }

      if (!pubchemInfo && !description && !meshId) {
        return null;
      }

      return {
        ncbiVerified: true,
        database: 'NCBI / NIH PubChem & MeSH',
        searchQuery: cleanQuery,
        pubchemCid: pubchemInfo?.cid || null,
        officialTitle: pubchemInfo?.title || cleanQuery,
        molecularFormula: pubchemInfo?.molecularFormula || null,
        molecularWeight: pubchemInfo?.molecularWeight ? `${pubchemInfo.molecularWeight} g/mol` : null,
        iupacName: pubchemInfo?.iupacName || null,
        meshId: meshId || null,
        pharmacologySummary: description || null,
        ncbiRefUrl: pubchemInfo?.cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemInfo.cid}` : `https://www.ncbi.nlm.nih.gov/mesh/?term=${encodeURIComponent(cleanQuery)}`
      };
    } catch (err) {
      console.warn('[NCBI Service Warning]:', err.message);
      return null;
    }
  }
}

module.exports = NcbiService;
