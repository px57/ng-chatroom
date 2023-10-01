import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChatroomComponent } from './components/chatroom/chatroom.component';
import { ChatroomService } from 'src/modules/chatroom/services/chatroom.service';

@NgModule({
  declarations: [
    ChatroomComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    ChatroomService,
  ],
  exports: [
    ChatroomComponent,
  ]  
})
export class ChatRoomModule {

}
