

import { Component, ViewChild } from '@angular/core'
import {
  ChatroomService,
  ChatroomMessage
} from 'src/modules/chatroom/services/chatroom.service'
import { Profile } from 'src/modules/profile/services/user.service'
import { UserService } from 'src/modules/profile/services/user.service'
import { SwitchModalService } from '../../../modal/services/switch-modal.service'
import { __db__ } from 'src/app/app.db'
import { InitialSettingsService } from '../../../../app/services/initial-settings.service'
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { SharedDataService } from 'src/app/services/shared-data.service'
import { HttpHeaders } from '@angular/common/http'
import { QuizDataService } from 'src/app/services/quiz-data.service'
import { combineLatest } from 'rxjs';
import { Router } from '@angular/router'

/**
 * @description:
 */
export interface Message {
  id: number
  activated: boolean
  content: string
  chatroom: number
  profile: Profile
  messageType: string
}
export interface Suggestion {
  file_path: string
  file_id: string
  file_name: string
  file_title: string
  page_num: number
  index: number
  paragraph: string
  text: string
}

export interface ExtensionMessage {
  file_reader: Suggestion
  summary_msg: string
  action_msg: string
}



//params




/**
 * @description: initial settings option type
 */
type initialSettingsType = 'all_industry' | 'all_business' | 'all_geographies'

/**
 * @description: user action option type
 */
type userActionType = 'like' | 'dislike' | 'copy'


@Component({
  selector: 'chatroom__chatroom',
  templateUrl:
    './../../../../templates/chatroom/chatroom/chatroom.component.html',
  styleUrls: [
    './../../../../templates/chatroom/chatroom/chatroom.component.scss'
  ]
})
export class ChatroomComponent {
  __db__ = __db__

  /**
   * @description:
   */
  @ViewChild('messages_container') messages_container: any

  selectedSector: string [] = [];
  geographyCom: string [] = [];
  nEmployees: string[] =  [];

  /**
   * @description:
   */
  public max_messages: number = 100

  /**
   * @description:
   */
  public messages: Array<ChatroomMessage> = []

  /**
   * @description:
   */
  public new_message: string = ''

  /**
   * @description:
   */
  public participants_counter: number = 0

  /**
   * @description: initial settings accepted value
   */
  // public initial_settings_validated_geography: boolean = false
  // public initial_settings_validated_company_type: boolean = false
  // public initial_settings_validated_industry: boolean = false
  public initial_settings_accepted: boolean = false

  /**
   * @description: initial settings accepted value
   */
  public is_ai_message_loading: boolean = false

  private baseDownloadUrl = window.location.origin; // Adjust this base URL to your Django server

  /**
   * @description:
   */
  constructor(
    private chatroomService: ChatroomService,
    public userService: UserService,
    public switchModalService: SwitchModalService,
    public initialSettingsService: InitialSettingsService,
    private sharedDataService: SharedDataService,
    private quizDataService: QuizDataService,
    private router: Router
  ) {
  }

  /**
   * @description:
   */
  public ngOnInit(): void {
    
    this.bindStreamChatroom()
    this.verifySe()


  }


  
  verifySe() {
    const userId = this.userService.get_profile_id(); // Certifique-se de que isto retorna o ID do usuário correto
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // Criar um objeto com 'user_id'
    const body = JSON.stringify({ user_id: userId });

    if (!localStorage.getItem('pageReloaded')) {
      // Marca que a página será recarregada
      localStorage.setItem('pageReloaded', 'true');

      // Recarrega a página
      location.reload();
  } else {
      // Remove a marcação para não recarregar novamente no futuro
      localStorage.removeItem('pageReloaded');

      const userId = this.userService.get_profile_id(); // Certifique-se de que isto retorna o ID do usuário correto
      const headers = new HttpHeaders({'Content-Type': 'application/json'});

      // Criar um objeto com 'user_id'
      const body = JSON.stringify({ user_id: userId });

      this.userService.post('settingsverify', body, { headers }).subscribe({
          next: (response: any) => {
              if (response.exists) {
                  // Se o registro existe, redirecionar para '/'
                  this.router.navigate(['/']);
              } else {
                  // Se não existe, redirecionar para '/profile-setting'
                  this.router.navigate(['/profile-setting']);
              }
          },
          error: (error: any) => {
              console.error(error);
          }
      });
  }
}

  public truncateWords(string : string, n_words : number) {
    // Split the string into words
    const words = string.split(' ');
  
    // Check if the string has more than ten words
    if (words.length > n_words) {
        // Join the first ten words and append '...'
        return words.slice(0, n_words).join(' ') + '...';
    }
  
    // If the string has ten words or less, return it as is
    return string;
  }
  
  
  /**
   * @description:
   */
  private bindStreamChatroom(): void {
    this.chatroomService.stream.subscribe((data) => {
      let event_key = 'recept__' + data.event
      if ((this as any)[event_key] === undefined) {
        alert(event_key + ' is not defined in Chatroom.component.ts')
      }
      ;(this as any)[event_key](data.data)
    })

    
    
  }

  /**
   * @description:
   */
  public ngOnDestroy(): void {}

  /**
   * @description:
   */
  public sendMessage(): void {
    if (!this.userService.is_authenticated()) {
      this.userService.open_login_modal()
      return
    }
    
    // `Hello ${param1}`;
    // var message = this.new_message
    // const message_with_settings = `Pour des entreprises du secteur \"${this.initialSettingsService.initialSettings.industry}\" de ${this.initialSettingsService.initialSettings.company_type} dans la region \"${this.initialSettingsService.initialSettings.geography}\". `
    // if( this.initialSettingsService.initialSettings != this.initialSettingsService.baseSettings ) {
    //   message = message_with_settings + message
    // }
    // console.log('sendMessage', this.new_message)

    this.chatroomService.call__send_message(this.new_message, 'new_message')
    this.new_message = ''
  }
  public handleSuggestionClick(suggestion: any): void {
    // Logic when a suggestion is clicked
    if (!this.userService.is_authenticated()) {
      this.userService.open_login_modal()
      return
    }
  
    const suggestionText = JSON.stringify(suggestion)
    // console.log('sendSuggestionn', suggestionText)
  
    this.chatroomService.call__send_message(suggestionText, "new_message_user_ext")
  
  }

  // @@@@@@@@@@@@@@
  /**
   * @description:
   */
  public recept__participants_counter(participants_counter: number): void {
    this.participants_counter = participants_counter
  }

  public getRoomIsLoading(): boolean {
    // console.log("getRoomIsLoading : ", this.chatroomService.room_is_loading)
    return this.chatroomService.room_is_loading
  }


  /**
   * @description:
   */
  public recept__messages(messages: Array<ChatroomMessage>): void {
    // console.log('recept__messages', messages)
    this.messages = messages
    // console.log('this.messages', this.messages)
    this.waitToScrollToBottom()
    this.loadInitialSetting()
    // this.initial_settings_accepted = false;
    // this.initialSettingsService.resetInitialSettings()
  }

  /**
   * @description:
   */
  public recept__new_message(message: Array<ChatroomMessage>): void {
    console.log('recept__new_message', message)

    // if message
    this.messages.push.apply(this.messages, message)
    this.is_ai_message_loading = true
    this.waitToScrollToBottom()
    // TODO: Limit the number of messages in the chatroom, and delete the oldest ones. (100 max)
    // if (this.messages.length > this.max_messages) {
    //   this.messages.shift();
    // }
  }  
  public recept__new_message_ai(message: Array<ChatroomMessage>): void {
    // console.log('recept__new_message_ai', message)
    this.messages.push.apply(this.messages, message)
    this.is_ai_message_loading = false
    // console.log('this.messages : ', this.messages)
    this.waitToScrollToBottom()
    // TODO: Limit the number of messages in the chatroom, and delete the oldest ones. (100 max)
    // if (this.messages.length > this.max_messages) {
    //   this.messages.shift();
    // }
  }

  /**
   * @description:
   */
  public recept__init(data: any): void {}

  /**
   * @description:
   */
  private waitToScrollToBottom(): void {
    setTimeout(() => {
      this.forceScrollToBottom()
    }, 100)
  }

  /**
   * @description:
   */
  private forceScrollToBottom(): void {
    this.messages_container.nativeElement.scrollTop = 100000
  }

  /**
   * @description: initial settings modal function
   */
  public handleOpenUserInitialSettingsModal(option: initialSettingsType): void {
    this.switchModalService.open_modal(option)
  }
  /**
   * @description: user actions function
   */
  public handleSelectAction(option: userActionType): void {
    alert(`handleSelectAction ${option}`)
  }

  /**
   * @description: user choise function
   */
  public handleSelectChoose(option: string): void {
    alert(`handleSelectChoose ${option}`)
  }

  /**
   * @description: user choise function
   */
  public handleOpenLexiqueModal(option: string): void {
    // this.switchModalService.open_modal('lexique', {
    //   lexique: option
    // })
  }

  /**
   * @description: user choise function
   */
  public handleCloseLexiqueModal(): void {
    // this.switchModalService.close()
  }

  /**
   * @description:
   */
  // public clipboard(): void {
  // this.link_copied = true;
  // navigator.clipboard.writeText(this.share_link);
  // this.countDown();
  // }

  /**
   * @description:
   */
  // public countDown() {
  //   if (this.time_left < 15) {
  //     setTimeout(() => {
  //       this.time_left = this.time_left + 1;
  //       this.countDown();
  //     }, 1000);
  //   }

  //   if (this.time_left === 15) {
  //     this.link_copied = false;
  //     this.time_left = 0;
  //   }
  // }

  /**
   * @description
   */
  public getAIMessage(aiResponse: any): string {
    // Parse the AI response here
    const aiResponseJSON = JSON.parse(aiResponse)
    // You might need to adjust the parsing logic based on the actual structure of `aiResponse`
    const message = aiResponseJSON.message;
    // Other parsing logic...
    return message;
  }
  public getSuggestionFromAIMessage(aiResponse: any): Array<Suggestion> {
    // Parse the AI response here
    const aiResponseJSON = JSON.parse(aiResponse)

    // console.log("aiResponse : ", aiResponse ) 

    const suggestion = aiResponseJSON.suggestion;

    console.log("suggestion : ", suggestion ) 
       // Other parsing logic...
    return suggestion;
  }
  public getTextFromExtendRequest(aiResponse: any): string {
    // Parse the AI response here
    const aiResponseJSON = JSON.parse(aiResponse)

    // console.log("getTextFromExtendRequest- aiResponse : ", aiResponse ) 

    const text = aiResponseJSON.text;

    // console.log("getTextFromExtendRequest - suggestion : ", text ) 
      // Other parsing logic...
    return text;
  }
  public getExtensionFromAIMessage(aiResponse: any): ExtensionMessage {
    // Parse the AI response here
    const aiResponseJSON = JSON.parse(aiResponse)

    // console.log("aiResponse : ", aiResponse ) 

    const extension = aiResponseJSON.message

    // console.log("extension : ", extension ) 
      // Other parsing logic...
    return extension;
  }



  public showVocabularyDetail(vocabId: string): void {
    // Logic to show vocabulary details
  }


  // public getFileUrl(file_id: string): string {
  //   const downloadUrl = `${this.baseDownloadUrl}/v1/mediacenter/documents/download/${file_id}/`;    
  //   console.log( "getFileUrl : ",  downloadUrl);
  //   return downloadUrl
  // }
  public getFileUrl(file_id: string): string {
    // Assuming file_name is provided without the .pdf extension
    const downloadUrl = `${this.baseDownloadUrl}/v1/mediacenter/documents/download/${file_id}.pdf`;    
    // console.log("getFileUrl : ", downloadUrl);
    return downloadUrl;
}

  public downloadDocument(file_id: string): void {
      window.open(this.getFileUrl(file_id), '_blank');
  }

  public callBackPDF(pdf: PDFDocumentProxy) {
    console.log( "Doc has loaded! ");
    window.dispatchEvent(new Event('resize'));
    // do anything with "pdf"
 }
 public scrollToPage(pageNumber: number): void {
  // Code to find and scroll to the specific page div
  const page = document.querySelector('.page[data-page-number="' + pageNumber + '"]');
  if (page) {
    page.scrollIntoView({ behavior: 'smooth' });
  }
}



public handleOpenPDFViewerModal(file_id: string, file_name: string, page_num: number, file_link: string): void {
  this.switchModalService.open_modal('pdf_viewer', {
    file_name: file_name,
    page_num: page_num,
    file_id: file_id,
    file_link: file_link,
  });

  // Setting a timer to call `scrollToPage`
  setTimeout(() => {
    this.scrollToPage(page_num);
  }, 3000); 
}

    // public convertToJSON(value: string): any {

  //   console.log('convertToJSON input: ', value)
  //   const jsonData = JSON.parse(value)

  //   console.log('jsonData: ', jsonData)

  //   console.log('\n-------\n')

  //   var message = jsonData.message
  //   console.log('message: ', message)

  //   return message

  //   // return 'Esta é uma mensagem de teste'
  // }

  /**
   * @description: sent initial settings
   */

  public handleSendInitialSettings(): void {
    const userId = this.userService.get_profile_id();
    if (userId === null) {
      console.error("UserID is null");
      return;
    }
  
    const id = { user_id: userId };
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    this.sharedDataService.selectedSector$.subscribe(sector => {
      console.log('Received sector:', sector);
      // ...
    });
  
    combineLatest([
      this.sharedDataService.selectedSector$,
      this.sharedDataService.nEmployees$,
      this.sharedDataService.countriesOperate$
    ]).subscribe(([sector, employees, countries]: [any, any, any]) =>  {
      this.selectedSector = sector;
      this.nEmployees = employees;
      this.geographyCom = countries;
  
      if (!this.selectedSector || this.selectedSector.length === 0 ||
          !this.nEmployees || this.nEmployees.length === 0 ||
          !this.geographyCom || this.geographyCom.length === 0) {
        this.fetchSectorFromQuizDataService();
      } else {
        this.continueWithInitialSettings();
      }
    });
  }

  private fetchSectorFromQuizDataService(): void {
    const userId = this.userService.get_profile_id();
    if (userId === null) {
      console.error("UserID is null");
      return;
    }
    console.log("Selected Sector:", this.selectedSector);
    const id = { user_id: userId };
    const headers = new HttpHeaders({'Content-Type': 'application/json'});
  
    this.quizDataService.getQuestionnaireData('getdata', id, { headers }).subscribe({
      next: (response: any) => {
        // Atualize aqui de acordo com a estrutura da sua resposta
        this.selectedSector = response.sector_activity.split(', ');
        this.nEmployees = response.workforce_size.split(', ');
        this.geographyCom = response.operation_countries.split(', ');
  
        this.continueWithInitialSettings();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
  selectedSectordef: string [] = [];
  geographyComdef: string [] = [];
  nEmployeesdef: string[] =  [];
  headquarters_location: number[]= [];
  net_revenue: number [] =[];
  total_assets: number[] = [];
  countries_with_most_employees: string [] = [];
  countries_with_highest_turnover: string [] = []
  has_subsidiaries: boolean  | null = null;
  owns_or_operates_factories: boolean | null = null;
  listed_in_eu_market: boolean | null = null;
  provides_public_services: boolean | null = null;




  private paramschat() {
    const userId = this.userService.get_profile_id();
    const id = { user_id: userId };
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

  
    this.quizDataService.getQuestionnaireData('getdata', id, { headers }).subscribe({
      next: (response: any) => {
        // Atualize aqui de acordo com a estrutura da sua resposta
        this.selectedSectordef = response.sector_activity;
        this.nEmployeesdef = response.workforce_size;
        this.geographyComdef = response.operation_countries;
        this.headquarters_location = response.headquarters_location;
        this. net_revenue = response.net_revenue;
        this.total_assets = response.total_assets;
        this.countries_with_most_employees = response.countries_with_most_employees;
        this.countries_with_highest_turnover = response.countries_with_highest_turnover;
        this.has_subsidiaries = response.has_subsidiaries;
        this.owns_or_operates_factories = response.owns_or_operates_factories
        this.listed_in_eu_market = response.listed_in_eu_market
        this.provides_public_services = response.provides_public_services

  
        this.continueWithInitialSettings();  // Chamada para processamento adicional
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
  
  
  private continueWithInitialSettings() {
    console.log("Select213213:", this.selectedSector);
  
    this.chatroomService.call__send_initial_settings({
      company_type: this.selectedSectordef,
      geography: this.nEmployeesdef,
      industry: this.geographyComdef,
      headquarters_location: this.headquarters_location
    });
  }

  public loadInitialSetting(): void {

    console.log("loadInitialSetting ")
    console.log("this.chatroomService.selected : ", this.chatroomService.selected)

    if ( this.chatroomService.selected && this.chatroomService.selected.geography != undefined ){

      console.log("Loading initial settings : ", this.chatroomService.selected.geography)

      this.initialSettingsService.initial_settings_accepted = true;
      this.initialSettingsService.loadInitialSettings( this.chatroomService.selected )

    } else {

      console.log("Resetting initial settings")

      this.initialSettingsService.initial_settings_accepted = false;
      this.initialSettingsService.resetInitialSettings()
    }
    console.log("-------")
  }




}





// public handleSendInitialSettings(): void {
//   const { company_size, geography, industry } =
//     this.initialSettingsService.initialSettings

//   if (!company_size || !geography || !industry) {
//     alert($localize`Initial settings missing!`)
//     this.initial_settings_accepted = false
//     return
//   }

//   console.log(
//     'handleSendInitialSettings',
//     this.initialSettingsService.initialSettings
//   )

//   this.initial_settings_accepted = true
// }