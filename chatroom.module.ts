import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { ChatroomComponent } from './components/chatroom/chatroom.component'
import { ToolsModule } from '../tools/tools.module'
import { MenuRoomListComponent } from './components/menu-room-list/menu-room-list.component'
// import { HaliroSvgComponent } from 'src/app/components/tools/haliro-svg/haliro-svg.component'

import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service'

@NgModule({
  declarations: [ChatroomComponent, MenuRoomListComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToolsModule],
  providers: [ChatroomService],
  exports: [ChatroomComponent, MenuRoomListComponent]
})
export class ChatRoomModule {}
