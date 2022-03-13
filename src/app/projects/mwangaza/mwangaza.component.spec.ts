import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MwangazaComponent } from './mwangaza.component';

describe('MwangazaComponent', () => {
  let component: MwangazaComponent;
  let fixture: ComponentFixture<MwangazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MwangazaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MwangazaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
