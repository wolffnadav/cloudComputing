import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterBusinessComponent } from './register-business.component';

describe('RegisterComponent', () => {
  let component: RegisterBusinessComponent;
  let fixture: ComponentFixture<RegisterBusinessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterBusinessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterBusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
