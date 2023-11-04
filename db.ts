
import { DB, DBList } from '../tools/classes/db';

const DJANGO_APP_NAME = 'chatroom';


class MessageDB extends DB {
    
    constructor() {
        super(`${DJANGO_APP_NAME}.Message`)
    }

}

class ChatroomDB extends DB {
    constructor() {
        super(`${DJANGO_APP_NAME}.Chatroom`)
    }
}


export const __chatroom_db__ =  new DBList({
    message: new MessageDB(),
    chatroom:  new ChatroomDB(),
})