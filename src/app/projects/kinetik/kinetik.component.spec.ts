import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KinetikComponent } from './kinetik.component';

describe('KinetikComponent', () => {
  let component: KinetikComponent;
  let fixture: ComponentFixture<KinetikComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KinetikComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KinetikComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
