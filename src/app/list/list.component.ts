import { CommonModule, formatDate } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { delay, filter, Subscription } from 'rxjs';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { PoModule, PoTableColumn, PoTableModule, PoButtonModule, PoMenuItem, PoMenuModule, PoModalModule, PoPageModule, PoToolbarModule, PoTableAction, PoModalAction, PoDialogService, PoNotificationService, PoFieldModule, PoDividerModule, PoTableLiterals, PoTableComponent, PoModalComponent,} from '@po-ui/ng-components';
import { ServerTotvsService } from '../services/server-totvs.service';
import { ExcelService } from '../services/excel-service.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PoModalModule,
    PoTableModule,
    PoModule,
    PoFieldModule,
    PoDividerModule,
    PoButtonModule,
    PoToolbarModule,
    PoMenuModule,
    PoPageModule,
    HttpClientModule
],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
 
  private srvTotvs = inject(ServerTotvsService);
  private srvExcel = inject(ExcelService);
  private formConsulta = inject(FormBuilder);
  private srvDialog = inject(PoDialogService);
  private srvNotification = inject(PoNotificationService);
  private formB = inject(FormBuilder);
  private formDados = inject(FormBuilder)

  @ViewChild('ttRenovacaoMensal') GridRenovacao!: PoTableComponent;
  @ViewChild('ChamaEntradas') telaRenovEntradas!: PoModalComponent;

  //Altera do Grid
  @ViewChild('telaAltera', { static: true }) telaAltera:  | PoModalComponent  | undefined;

  //Referencia ao componente de login
  @ViewChild('loginModal_login', { static: true }) loginModal_login: PoModalComponent | undefined;

  opcoesGrid: Array<PoTableAction> = [
    //{ label: "Detalhes" , action: this.Detalhe.bind(this), icon: 'po-icon po-icon-plus-circle' },
    //{ label: "Log" , action: this.Log.bind(this), icon: 'po-icon po-icon-news' },
  ]

  constructor( 
    private Pnotifica: PoNotificationService,
    private msgDialog: PoDialogService,
    private router: Router) { }

  //Variaveis 
  labelLoadTela:string = ''
  loadTecnico: string = 'Selecione o técnico'
  loadTela: boolean = false
  loadExcel: boolean = false
  listaEstabelecimentos: any[] = [];
  alturaGrid:number=window.innerHeight - 280
  codFilial!: string;
  registros!: any[];
  codEstabelecimento_login:string=''
  codUsuario_login:string=''
  senha_login:string=''
  placeHolderEstabelecimento!: string
  codEstabelecimento: string=''
  codTecnico: string=''
  listaTecnicos: any[] = []
  labelContador:string[]=[]
  
  //Formulario
  public form = this.formConsulta.group({
    DtRenovEntr: [new Date(), Validators.required],
    HrRenovEntr: ['', Validators.required],
    DtRenovSai: [new Date(), Validators.required],
    HrRenovSai: ['', Validators.required],
  });

  //Form Selecão
  public formSel = this.formDados.group({
    "cCodEstabel": ['', Validators.required],
    "iCodEmitente": ['', Validators.required],
    "itpBusca": [2, Validators.required],
  });

  //Form Altera do Grid
  public formAltera = this.formB.group({
    "dDtRenovSai": ['', Validators.required],
    "chrRenovSai": ['', Validators.required],
  });

  //---Grid
  linhaSelecionada: any = undefined
  objSolic!: any[];
  pesquisa!:string
  colunas!: PoTableColumn[]
  lista!: any[]
   customLiterals: PoTableLiterals = {
    noData: 'Infome os filtros para Buscar os Dados',    
  };

  //----- Tela Login
acaoLogin_login: PoModalAction = {
  action: () => {
    //this.onLogarUsuario()
  },
  label: 'Login',
  
};

//------------------------------------------------------------ Change Estabelecimentos - Popular técnicos
public onEstabChange(obj: string) {
  if (obj === undefined) return

  //Popular o Combo do Emitente
  this.listaTecnicos = []
  this.codTecnico= ''
  this.listaTecnicos.length = 0;
  this.loadTecnico = `Populando técnicos do estab ${obj} ...`

  this.codEstabelecimento = obj

  this.srvTotvs
    .ObterEmitentesDoEstabelecimento(obj).subscribe({
      next: (response:any) => {
          delay(200)         
          this.listaTecnicos = response
          this.loadTecnico = 'Selecione o técnico'
      },
     // error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
    });
   
}

//------------------------------------------------------------- Change Tecnicos - Popular Endereco Entrega
public onTecnicoChange(obj:string){
  if (obj === undefined) return

  this.loadTela = true
  this.registros = []

  //Parametros estabelecimento e tecnico
  let params: any = { items: this.formSel.value}

  //Obter dados do Grid
  this.srvTotvs.ObterDados(params).subscribe({
    next: (response: any) => {
      console.log(response.items)
      this.registros = response.items

      this.loadTela = false
      this.totalLabelAtivos()
      this.registros.sort(this.srvTotvs.ordenarCampos(['cCodEstab']))
      this.srvNotification.success('Dados listados com sucesso !')     
      
    },
    error: (e) => {
      
      this.loadTela = false
      
    },
    complete: () => {

      setTimeout(() => {
        let filtro = (document.querySelector('.po-search-input') as HTMLInputElement)
        filtro.dispatchEvent(new Event('input',{bubbles:true}))
      }, 500);

    }
  })
}

private totalLabelAtivos() {

  let colunaSituacao = this.colunas.findIndex(col => col.property === 'ctpNatOper')   //nome do campo
  let labelsSituacao = this.colunas[colunaSituacao].subtitles as any[]
  
  labelsSituacao.forEach(itens => {
    //itens.label = itens.label.split('(')[0] + ' (' + this.registros.filter(data => data.ctpNatOper === itens.value).length + ')'
    itens.label = this.registros.filter(data => data.ctpNatOper === itens.value).length
  })

}

acaoLogin_cancel: PoModalAction = {
  action: () => {
    this.loginModal_login?.close()
  },
  label: 'Cancelar'
};

  mostrarDetalhe(row:any, index: number) {
    return true;
  }

  public ChamaRenovacaoMensal(): void {
    // Gerar alerta -> console.log(this.GridRenovacao.getSelectedRows());
    //Obter os registros selecionados no grid

    this.telaRenovEntradas.close();

    
    this.loadTela = true;
    let registrosSelecionados = this.GridRenovacao.getSelectedRows();

    //Verificar se existe algum registro selecionado, caso nao exista,
    //exibir msg para o usuario na tela

    if (this.GridRenovacao.getSelectedRows().length > 0) {

      //Dialog solicitando confirmacao de processamento
      this.msgDialog.confirm({

        title: 'Confirma Execução?',
        message: 'Processar a Renovação Mensal dos registros selecionados ? ',
        literals: { cancel: 'Cancelar', confirm: 'Processar' },

        //Caso afirmativo
        confirm: () => {

          //Montar IDs de registros selecionados no grid
          let registrosComSeparador = '';

          registrosSelecionados.forEach((item) => { registrosComSeparador += item['CodEmitente'] + ';' });

          //Passando os parametros de data e hora entrada e saida do FORM
          //let paramsTela: any = { paramsTela: this.form.value }

          //Passando os parametros de técnicos selecionados
          let params = { DtRenovEntr: this.form.controls['DtRenovEntr'].value,
                         HrRenovEntr: this.form.controls['HrRenovEntr'].value,
                         DtRenovSai:  this.form.controls['DtRenovSai'].value,
                         HrRenovSai:  this.form.controls['HrRenovSai'].value,
                         CodFilial:   this.codFilial, 
                         CodEmitente: registrosComSeparador };

          //Chamar a api para processar registros
          /*this.srvTotvs.ExecEntradas(params).subscribe({
            next: (data: any) => { 
                this.labelLoadTela = "Gerando Renovação Mensal"
                this.loadTela = true; 
            },
            error: (e:any) => {

              this.loadTela = false;
              //mensagem pro usuario
              this.Pnotifica.error("Erro ao chamar ExecEntradas.:" + e)
            },

            complete: () => {

              this.loadTela = false;
              this.Pnotifica.success("Processo de Renovação Mensal Agendado com sucesso.")
              this.atualizar();

            }
          })
            */

          //this.atualizar();

        },

        //Caso cancelado notificar usuario
        cancel: () => {
          
          this.loadTela = false
          this.Pnotifica.error('Cancelado pelo usuario')
        
        }

      });

    }
    //Nenhum Registro selecionado no grid
    else {
      this.Pnotifica.error('1Nenhum registro selecionado !')
      
    }
  }

  

  //Funcao 
  public PrimeiroDiaDoMes() {
    let hoje = new Date()
    let toDate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

    this.form.controls.DtRenovSai.setValue(toDate)
  }

  public ultimoDiaUtilDoMes() {
    let hoje = new Date()
    let toDate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    while (toDate.getDate() == 0 || toDate.getDate() == 6)
      toDate.setDate(toDate.getDate() - 1);

    this.form.controls.DtRenovEntr.setValue(toDate)

  }

  //Chama tela do TOTVS
  public AbrirTelaTOTVS(programa: string): void {
    let params: any = { program: programa, params: '' };
    this.srvTotvs.AbrirTelaTOTVS(params).subscribe({
      next: (response: any) => {},
      error: (e) => {
        this.loadTela = false;
        //mensagem pro usuario
        this.Pnotifica.error("Erro ao chamar AbrirTelaTOTV:" + e)
      },
    });
  }

  ngOnInit(){    
    
    this.formSel.controls['itpBusca'].setValue(1)
 
    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunas()

    /*this.srvTotvs.obterColunas().subscribe(
      (data: { items: Array<any> }) => {
        this.colunas = data.items;
      });*/

    this.placeHolderEstabelecimento = 'Aguarde, carregando lista...'
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (data:any) => { 
                        this.listaEstabelecimentos = [];
                        this.listaEstabelecimentos = (data as any[]).sort(this.srvTotvs.ordenarCampos(['label']))
                        this.placeHolderEstabelecimento = 'Selecione um estabelecimento'

                        this.listaEstabelecimentos = data;
                      },
      error: (error:any) => { this.Pnotifica.error("Ocorreu um erro:" + error)  
      },
      complete: () => { //console.log('O carregamento terminou com sucesso !') 
                        //this.Pnotifica.success("O carregamento terminou com sucesso !")  
      }
    });
  }

  public FecharChamaEntradas(): void {

    this.telaRenovEntradas.close();

  }

  public atualizar(): void {
    this.labelLoadTela = "Carregando Técnicos"
    this.loadTela = true;
    
    this.onTecnicoChange('')
  }

  public onExportarExcel() {
    let titulo = "ITEM EM PODER DO TÉCNICO FILIAL" //this.tituloTela.split(':')[0]
    let subTitulo = "SALDO TERCEIROS DO TÉCNICO" //this.tituloTela.split(':')[1]
    this.loadExcel = true

    //let valorForm: any = { valorForm: this.form.value }
    this.srvExcel.exportarParaExcel('ITEM EM PODER DO TÉCNICO FILIAL ', // + titulo.toUpperCase(),
      subTitulo.toUpperCase(),
      this.colunas,
      this.registros,
      'SaldoTercTecnico_' + this.codTecnico,
      this.codEstabelecimento + "_" + this.codTecnico)

    this.loadExcel = false;
  }

  calculaTotal(){

    
  }
  
  //Alterar Grid
  onAlterarGrid(obj: any | null){

    this.objSolic = [obj.CodEmitente + ' - ' + obj.NomeAbrev]
    this.linhaSelecionada = obj

    this.telaAltera?.open();

    if ((obj !== null) && (obj['$showAction'] !== undefined))
       delete obj['$showAction']

    if (obj !== null) {
      this.formAltera.patchValue(obj)
    }

  }
  readonly acaoAlterarLinha: PoModalAction = {
    label: 'Salvar',
    action: () => {this.onSalvar()},
   
    disabled: !this.formAltera.valid,
  };

  readonly acaoCancelarLinha: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaAltera?.close();
    },
  }
  //---Salvar Registro
  onSalvar() {
    
    this.linhaSelecionada.dDtRenovSai = this.formAltera.controls.dDtRenovSai.value
    this.linhaSelecionada.chrRenovSai = this.formAltera.controls.chrRenovSai.value
    
    this.telaAltera?.close();
  }

  //marcar desmarcar linha
  total = 0
  changeOptions(selecionados: any[]) {

    this.total = this.GridRenovacao.getSelectedRows().length    

  }
}
