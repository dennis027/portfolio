import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortraitScene } from './portrait-scene';

describe('PortraitScene', () => {
  let component: PortraitScene;
  let fixture: ComponentFixture<PortraitScene>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortraitScene]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortraitScene);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
