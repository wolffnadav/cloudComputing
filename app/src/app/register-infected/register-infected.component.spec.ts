import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterInfectedComponent } from './register-infected.component';

describe('RegisterInfectedComponent', () => {
  let component: RegisterInfectedComponent;
  let fixture: ComponentFixture<RegisterInfectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterInfectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterInfectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
