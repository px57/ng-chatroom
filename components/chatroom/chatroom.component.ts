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
    public initialSettingsService: InitialSettingsService
  ) {
  }

  /**
   * @description:
   */
  public ngOnInit(): void {

    this.bindStreamChatroom()
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

    const extension = aiResponseJSON.message;

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

  public handleOpenPDFViewerModal(file_id: string, file_name: string, page_num: number, file_link: string): void {
    this.switchModalService.open_modal('pdf_viewer', {
      file_name: file_name,
      page_num: page_num,
      file_id: file_id,
      file_link: file_link,
    })
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
    const { company_type, geography, industry } =
      this.initialSettingsService.initialSettings
    // ... existing code ...

    console.log("handleSendInitialSettings ")
    console.log("this.initialSettingsService.initialSettings : ", this.initialSettingsService.initialSettings)

    // This is important for the client to save the settings when navigating between rooms.
    if ( this.chatroomService.selected ) {
      this.chatroomService.selected.companyType = company_type
      this.chatroomService.selected.geography = geography
      this.chatroomService.selected.industry = industry
    }

    this.chatroomService.call__send_initial_settings({
      company_type: company_type,
      geography: geography,
      industry: industry
    });
  
    this.initialSettingsService.initial_settings_accepted = true;
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