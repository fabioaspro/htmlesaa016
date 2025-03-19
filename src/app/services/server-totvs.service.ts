import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, map, of, take, tap } from 'rxjs';
import { Observable } from 'rxjs';
import { PoTableColumn } from '@po-ui/ng-components';
import { environment } from '../environments/environment'

//--- Header somente para DEV
const headersTotvs = new HttpHeaders(environment.totvs_header)

@Injectable({
  providedIn: 'root'
})
export class ServerTotvsService {
  private reg!:any;
  _url = environment.totvs_url;
  
  constructor(private http: HttpClient ) { }

  
  //---------------------- Variaveis Globais
  public ObterVariaveisGlobais(params?: any){
    return this.http.get(`${this._url}/ObterVariaveisGlobais`, {params, headers:headersTotvs}).pipe(take(1));
  }

  //Chama tela do TOTVS
  public AbrirTelaTOTVS(params?:any){
    return this.http.get('/totvs-menu/rest/exec', { params, headers: headersTotvs }).pipe(take(1));
  }
  
  //------------ Colunas Grid Prioridade
  obterColunas(): Array<PoTableColumn> {
    return [
      { property: 'cEstab',          label: "Estab", visible: false}, //, type: 'number', format: "1.0-0", visible: false},
      { property: 'cEmitente',       label: "Emitente", visible: false}, 
      { property: 'itCodigo',        label: "Item"},
      { property: 'cDesc',           label: "Descrição", width: '300px'}, 
      { property: 'cDocto',          label: "Documento"}, 
      { property: 'cSerie',          label: "Serie"},
      { property: 'cNatOper',        label: "Nat.Oper."},
      { property: 'ctpNatOper',      label: "TP", type: 'subtitle',
        subtitles: [
          { value: "KIT",       color: 'color-02', label: "", content: "KT"},
          { value: "EXTRA-KIT", color: 'color-07', label: "", content: "ET"},
        ]
      },
      { property: 'dDtRetorno',      label: "Dt.Ret."},
      { property: 'iQtde',           label: 'Qtde', type: 'number'},
      { property: 'cTpNatureza',     label: "Tp.Nat."},
      { property: 'cTpSalTerc',      label: "Tp.ST."},
      { property: 'cTipoUso',        label: "Tp.Uso"},
      { property: 'cNfOriginal',     label: "Nf.Original"},
      { property: 'dDtnfOriginal',   label: "Dt.Nf.Original", type:'date', format: "dd/MM/yyyy"},
      { property: 'cNfAnterior',     label: "Nf.Anterior"},
      { property: 'dDtNfAnterior',   label: "Dt.Nf.Anterior", type:'date', format: "dd/MM/yyyy"},
    ];
  }

  
  //---------------------- Obter Lista Completa
  public UpdloadArquivo(params?: any){
    return this.http.post(`${this._url}/addFiles`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //---------------------- Obter Lista Completa
  public EfetivarArquivo(params?: any){
    return this.http.post(`${this._url}/EfetivarArquivo`, params, {headers:headersTotvs}).pipe(take(1))
  }
  
  //---------------------- Obter Lista Completa
  public ObterArquivo(params?: any){
    return this.http.get(`${this._url}/ObterArquivo`, {params:params, headers:headersTotvs}).pipe(take(1));
  }

  //---------------------- Obter Lista Completa
  public ObterDados(params?: any){
    return this.http.post(`${this._url}/ObterDados`, params, {headers:headersTotvs}).pipe(take(1))
  }

  //Usando paginação
  public ObterDadosP(params?: any){
    return this.http.post(`${this._url}/ObterDadosP`, params, {headers:headersTotvs}).pipe(take(1))
  }
  
  //abaixo não é usado, só exemplo
  //------------ Colunas Grid Prioridade
  obterColunasEmergencial(): Array<PoTableColumn> {
    return [         
      { property: 'Ativo', label: 'Ativo', type: 'subtitle',
        subtitles: [
          { value: 'Sim', color: 'color-10', label: '', content: 'S'},
          { value: 'Não', color: 'color-07', label: '', content: 'N'},
        ]},
      { property: 'codEstabel',    label: "Estab"},
      { property: 'codFilial',     label: "Fil Emerg"},
      { property: 'itCodigo',      label: "Item", width: '300px' },
      { property: 'qtdEmerg',      label: "Qtd.Emerg."},
      { property: 'qtdPend',       label: "Qtd.Pend."},
      { property: 'Obs',           label: "Observação"},
      { property: 'Inclusao',      label: "Inclusão"},      
    ];
  }
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterEstabelecimentos(params?: any){
    return this.http.get<any>(`${this._url}/ObterEstab`, {params: params, headers:headersTotvs})
                 .pipe(
                  ///tap(data => {console.log("Retorno API TOTVS => ", data)}),
                  map(item => { return item.items.map((item:any) =>  { return { label:item.codEstab + ' ' + item.nome, value: item.codEstab, codFilial: item.codFilial } }) }),
                  ///tap(data => {console.log("Data Transformada pelo Map =>", data)}),
                  take(1));
  }
  
//---------------------- COMBOBOX TECNICOS
  /*Retorno transformado no formato {label: xxx, value: yyyy}*/
  public ObterEmitentesDoEstabelecimento(id:string){
    return this.http.get<any>(`${this._url}/ObterTecEstab?codEstabel=${id}`, {headers:headersTotvs})
                 .pipe(
                  map(item => { return item.items.map((item:any) =>  { return { label: item.codTec + ' ' + item.nomeAbrev, value: item.codTec  } }) }),
                  take(1));
  }
  
  //---------------------- Obter Lista Completa
  public ObterBRR(params?: any){
    return this.http.post(`${this._url}/ObterBRR`, params, {headers:headersTotvs}).pipe(take(1))
  }
  
  //---------------------- Obter Lista Completa
  public Obter(params?: any){
    return this.http.get(`${this._url}/ObterLT`, {params:params, headers:headersTotvs}).pipe(take(1));
  }

  //---------------------- Obter Linha Editada
  public ObterID(params?: any){
    return this.http.get(`${this._url}/ObterLTId`, {params:params, headers:headersTotvs}).pipe(take(1));
  }
  //---------------------- Salvar registro
  public Salvar(params?: any){
    return this.http.post(`${this._url}/SalvarLT`, params, {headers:headersTotvs})
                .pipe(take(1));
  }

  //---------------------- Deletar registro
  public Deletar(params?: any){
    return this.http.get(`${this._url}/DeletarEmergencial`, {params:params, headers:headersTotvs})
                    .pipe(take(1));
  }
  
  //Ordenacao campos num array
  public ordenarCampos = (fields: any[]) =>
    (a: { [x: string]: number }, b: { [x: string]: number }) =>
      fields
        .map((o) => {
          let dir = 1;
          if (o[0] === '-') {
            dir = -1;
            o = o.substring(1);
          }
          return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
        })
        .reduce((p, n) => (p ? p : n), 0);

}