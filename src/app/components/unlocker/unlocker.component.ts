import { Component, ViewChild, Output, EventEmitter, OnInit, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import {
  IMqttMessage,
  MqttModule,
  MqttService,
  IMqttServiceOptions
} from 'ngx-mqtt';

@Component({
  selector: 'unlocker',
  templateUrl: './unlocker.component.html',
  styleUrls: ['./unlocker.component.scss']
})
export class Unlocker implements OnInit {
  public submessage: string;
  setIntID;
  theRange;
  slideState: boolean;
  slideContent: string;
  redValue: number;
  greenValue: number;
  @Output() unlocked: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('unlock') input: any;

  constructor(private _mqttService: MqttService, private elementRef: ElementRef, private storage: Storage) {
    this._mqttService.observe('leddoor').subscribe((submessage: IMqttMessage) => {
      this.submessage = submessage.payload.toString();
      if (this.submessage == '1') {
        this.theRange = 100;
        this.initValue2();
      }
      else {
        this.theRange = 0;
        this.initValue1();
      }
    });
  }

  ngOnInit() {
    this.storage.ready().then(() => {
      this.storage.forEach((value, key) => {
        console.log(value, key);
        if (key == 'theRange') {
          this.theRange = value;
          if (this.theRange == 0)
            this.initValue1();
          if (this.theRange == 100)
            this.initValue2();
        }
      });
    });
    this.slideState = true;
    this.slideContent = 'arm-content';
  }

  ngOnDestroy() {
    this.storage.set('theRange', this.theRange);
  }

  checkUnlock(evt: Event) {
    this.theRange = Number(this.input.nativeElement.value);
    if (evt.type == 'touchend' && this.slideState == false) {
      if (this.theRange === 100) {
        this.Action(true);
      } else {
        this.setIntID = setInterval(() => {
          this.updateValue();
          if (this.input.nativeElement.value > 0) {
            this.input.nativeElement.value = this.theRange--;
          } else {
            this.input.nativeElement.value = 0;
            this.unlocked.emit(false);
            clearInterval(this.setIntID);
          }
        }, 1);
      }
    } else if (evt.type == 'touchend' && this.slideState == true) {
      if (this.theRange === 0) {
        this.Action(false);
      } else {
        this.setIntID = setInterval(() => {
          this.updateValue();
          this.elementRef.nativeElement.style.setProperty('--disarmRight', String(-180 + ((100 - this.input.nativeElement.value) * 2.4)) + 'px'); if (this.input.nativeElement.value < 100) {
            this.input.nativeElement.value = this.theRange++;
          } else {
            this.input.nativeElement.value = 100;
            this.unlocked.emit(true);
            clearInterval(this.setIntID);
          }
        }, 1);
      }
    }
  }

  Action(state: boolean) {
    this.unlocked.emit(state);
    this.slideState = state;
    if (state) {
      this.slideContent = 'disarm-content';
    } else {
      this.slideContent = 'arm-content';
    }
  }

  updateValue() {
    this.elementRef.nativeElement.style.setProperty('--armLeft', String(-218 + (this.input.nativeElement.value * 2.4)) + 'px');
    this.elementRef.nativeElement.style.setProperty('--disarmRight', String(-180 + ((100 - this.input.nativeElement.value) * 2.4)) + 'px');
    this.elementRef.nativeElement.style.setProperty('--redValue', String(this.input.nativeElement.value * 2));
    this.elementRef.nativeElement.style.setProperty('--greenValue', String((100 - this.input.nativeElement.value) * 2));
    this.elementRef.nativeElement.style.setProperty('--redValue2', String(this.input.nativeElement.value));
    this.elementRef.nativeElement.style.setProperty('--greenValue2', String(100 - this.input.nativeElement.value));
  }
  initValue1() {
    this.elementRef.nativeElement.style.setProperty('--armLeft', '-218px');
    this.elementRef.nativeElement.style.setProperty('--redValue', 0);
    this.elementRef.nativeElement.style.setProperty('--greenValue', 200);
    this.elementRef.nativeElement.style.setProperty('--redValue2', 0);
    this.elementRef.nativeElement.style.setProperty('--greenValue2', 100);
  }
  initValue2() {
    this.elementRef.nativeElement.style.setProperty('--armLeft', '23px');
    this.elementRef.nativeElement.style.setProperty('--redValue', 200);
    this.elementRef.nativeElement.style.setProperty('--greenValue', 0);
    this.elementRef.nativeElement.style.setProperty('--redValue2', 100);
    this.elementRef.nativeElement.style.setProperty('--greenValue2', 0);
  }

}
