import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRoomListComponent } from './menu-room-list.component';

describe('MenuRoomListComponent', () => {
  let component: MenuRoomListComponent;
  let fixture: ComponentFixture<MenuRoomListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuRoomListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuRoomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
