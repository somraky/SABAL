import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { Observable } from 'rxjs';
import {
  IMqttMessage,
  MqttModule,
  MqttService,
  IMqttServiceOptions
} from 'ngx-mqtt';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-smoke',
  templateUrl: './smoke.page.html',
  styleUrls: ['./smoke.page.scss'],
})
export class SmokePage implements OnInit {
  public submessage: string = "0";
  public dismessage: string = "0";
  public status: string = "OK";
  public rangeValue: number;
  public securedRangeOpen: boolean = false;
  public senserOn: boolean = true;
  public isDanger: boolean = false;

  constructor(private _mqttService: MqttService, private storage: Storage, private localNotifications: LocalNotifications, private platform: Platform) {
    this._mqttService.observe('smoke').subscribe((submessage: IMqttMessage) => {
      this.submessage = submessage.payload.toString();
      //console.log(this.submessage);
      if (this.senserOn) {
        if (Number(this.submessage) > this.rangeValue) {
          this.dismessage = this.submessage;
          this.status = "Danger";
          this.isDanger = true;
          this.alertNotification();
        } else {
          this.dismessage = this.submessage;
          this.status = "OK";
          this.isDanger = false;
        }
      }else{
        this.dismessage = '0';
        this.status = "Senser Off";
      }
    });
  }

  alertNotification() {
    this.platform.ready().then(() => {
      this.localNotifications.schedule({
        title: 'Smoke Alert!!!!',
        text: 'Detect more smoke in your room!',
        trigger: { at: new Date(new Date().getTime()) },
        led: 'FF0000',
        sound: null
      });
    });
  }

  toogleSetting() {
    this.securedRangeOpen = !this.securedRangeOpen;
  }


  ngOnInit() {
    this.storage.ready().then(() => {
      this.storage.forEach((value, key) => {
        console.log(value, key);
        if (key == 'smokeRangeValue') {
          this.rangeValue = value;
        }
        if (key == 'senserOn') {
          this.senserOn = value;
        }
      });
    });
  }

  ngOnDestroy() {
    this.storage.set('smokeRangeValue', this.rangeValue);
    this.storage.set('senserOn', this.senserOn);
  }

}
