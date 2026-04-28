import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectorMasterComponent } from './selector-master.component';
describe('SelectorMasterComponent', () => { 
  let component: SelectorMasterComponent; 
  let fixture: ComponentFixture<SelectorMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorMasterComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(SelectorMasterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});