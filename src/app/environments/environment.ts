// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  totvs_url:    'https://hawebdev.dieboldnixdorf.com.br:8543/api/integracao/services/v1/apiesaa016', //desenv
  //totvs_url: 'https://hawebdev.dieboldnixdorf.com.br:8143/api/integracao/services/v1/apiesaa016', //projetos
  totvs_header:{
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa("super:prodiebold11"),
    'CompanyId': 1
  },
  headersTotvsI: {    
    'Authorization': 'Basic c3VwZXI6cHJvZGllYm9sZDEx',
    'CompanyId': '1'
  },
  totvs_spool: 'http://10.151.120.56/SPOOL/'
};

