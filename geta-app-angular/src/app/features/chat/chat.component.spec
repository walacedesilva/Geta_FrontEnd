import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponentTs } from './chat.component.ts';

describe('ChatComponentTs', () => {
  let component: ChatComponentTs;
  let fixture: ComponentFixture<ChatComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponentTs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatComponentTs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
