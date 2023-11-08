import { Component, ViewChild } from '@angular/core'
import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service'
import { Profile } from 'src/modules/profile/services/user.service'
import { UserService } from 'src/modules/profile/services/user.service'
import { SwitchModalService } from '../../../modal/services/switch-modal.service'

/**
 * @description:
 */
export interface Message {
  id: number
  activated: boolean
  content: string
  chatroom: number
  profile: Profile
}

/**
 * @description: initial settings option type
 */
type initialSettingsType = 'all_sectors' | 'all_business' | 'all_geographies'

@Component({
  selector: 'chatroom__chatroom',
  templateUrl:
    './../../../../templates/chatroom/chatroom/chatroom.component.html',
  styleUrls: [
    './../../../../templates/chatroom/chatroom/chatroom.component.scss'
  ]
})
export class ChatroomComponent {
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
  public messages: Array<Message> = []

  /**
   * @description:
   */
  public new_message: string = ''

  /**
   * @description:
   */
  public participants_counter: number = 0

  /**
   * @description:
   */
  public message_content: string = `
  1. Le Green Deal  est une stratégie de croissance de l’Union européenne qui vise à transformer l’Europe en une économie et
  votre entreprise aux ESG réglementaires.¹ <br />
  Pour votre entreprise, voici les actions à effectuer : <br />
  2. Publier des informations non financières : Les grandes entreprises qui sont des entités d’intérêt public et les entités d’intérêt public qui sont les entreprises mères d’un grand groupe doivent publier une déclaration non financière qui fournit des informations sur les questions environnementales, sociales et de gouvernance (ESG) liées à leur activité. Les PME sont exemptées de ces exigences supplémentaires.²<br />
  3. Adopter une politique de diversité : Les entreprises sont encouragées à améliorer la transparence concernant leur politique de diversité et à favoriser la présence de membres diversifiés dans leurs organes de direction. Cela contribue à une meilleure gouvernance de l’entreprise et favorise l’introduction de nouvelles perspectives.¹ <br />
  4. Prendre des mesures pour lutter contre la corruption : Les grandes entreprises doivent mettre en place des actions préventives pour lutter contre la corruption.¹ <br />
  5. Promouvoir et respecter les droits de l’homme : Les grandes entreprises doivent promouvoir et respecter les conventions fondamentales de l’Organisation internationale du travail concernant la liberté d’association, le droit de négociation collective, l’élimination des discriminations en matière d’emploi et de profession, et l’abolition effective du travail des enfants.² <br />
  Veuillez noter que ces actions sont basées sur les informations extraites des documents officiels de la Commission européenne et peuvent être sujettes à des modifications ou à des ajouts ultérieurs. Il est recommandé de consulter les réglementations spécifiques applicables à votre secteur d’activité et de prendre conseil auprès de professionnels juridiques ou réglementaires pour vous assurer de la conformité de votre entreprise aux ESG réglementaires. <br />
  Sources : <br />
 `

  /**
   * @description:
   */
  constructor(
    private chatroomService: ChatroomService,
    public userService: UserService,
    public switchModalService: SwitchModalService
  ) {}

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
    this.chatroomService.call__send_message(this.new_message)
    this.new_message = ''
  }

  // @@@@@@@@@@@@@@
  /**
   * @description:
   */
  public recept__participants_counter(participants_counter: number): void {
    this.participants_counter = participants_counter
  }

  /**
   * @description:
   */
  public recept__messages(messages: Array<Message>): void {
    this.messages = messages
    this.waitToScrollToBottom()
  }

  /**
   * @description:
   */
  public recept__new_message(message: Message): void {
    this.messages.push(message)
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
}
