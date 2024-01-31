import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ChatroomComponent } from './components/chatroom/chatroom.component'
import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service'
import { MenuRoomListComponent } from './components/menu-room-list/menu-room-list.component'
import { ToolsModule } from '../tools/tools.module'
import { FeelingModule } from '../feeling/feeling.module'
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ParameterProfileComponent } from '../parameter-profile/components/parameter-profile.component'
import { ParameterProfileModule } from '../parameter-profile/parameter-profile.module'



@NgModule({
  declarations: [ChatroomComponent, MenuRoomListComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToolsModule,
    FeelingModule,
    PdfViewerModule,
    ParameterProfileModule,

    

  ],
  providers: [ChatroomService],
  exports: [ChatroomComponent, MenuRoomListComponent]
})
export class ChatRoomModule {}
