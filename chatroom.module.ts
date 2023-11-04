import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatroomComponent } from './components/chatroom/chatroom.component';
import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service';
import { MenuRoomListComponent } from './components/menu-room-list/menu-room-list.component';
import { ToolsModule } from '../tools/tools.module';
import { FeelingModule } from '../feeling/feeling.module';

@NgModule({
  declarations: [
    ChatroomComponent,
    MenuRoomListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToolsModule,
    FeelingModule,
  ],
  providers: [
    ChatroomService,
  ],
  exports: [
    ChatroomComponent,
    MenuRoomListComponent,
  ]  
})
export class ChatRoomModule {

}
