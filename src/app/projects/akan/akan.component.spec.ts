import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AkanComponent } from './akan.component';

describe('AkanComponent', () => {
  let component: AkanComponent;
  let fixture: ComponentFixture<AkanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AkanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AkanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
