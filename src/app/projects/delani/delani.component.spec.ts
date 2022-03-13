import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelaniComponent } from './delani.component';

describe('DelaniComponent', () => {
  let component: DelaniComponent;
  let fixture: ComponentFixture<DelaniComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelaniComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelaniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
