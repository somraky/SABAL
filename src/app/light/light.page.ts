import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { CardContent, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Platform } from '@ionic/angular';

import { Observable, Timestamp } from 'rxjs';
import {
  IMqttMessage,
  MqttModule,
  MqttService,
  IMqttServiceOptions
} from 'ngx-mqtt';

import * as moment from 'moment';

@Component({
  selector: 'app-light',
  templateUrl: './light.page.html',
  styleUrls: ['./light.page.scss'],
})

export class LightPage implements OnInit {
  public lightvalue: boolean[] = [];
  public submessage: string;

  public notifyTime: any;
  public chosenHours: number;
  public chosenMinutes: number;

  public ontime = [];
  public offtime = [];

  public lightItems = [
    {
      name: 'Light1',
      open: false,
    },
    {
      name: 'Light2',
      open: false
    },
    {
      name: 'Light3',
      open: false
    },
    {
      name: 'Light4',
      open: false
    }
  ];

  constructor(private _mqttService: MqttService, private storage: Storage, private platform: Platform, private localNotifications: LocalNotifications, public alertController: AlertController) {
    this._mqttService.observe('my/topic').subscribe((submessage: IMqttMessage) => {
      this.submessage = submessage.payload.toString();
      console.log(this.submessage);
    });

    this.notifyTime = moment(new Date()).format();

    this.chosenHours = new Date().getHours();
    this.chosenMinutes = new Date().getMinutes();
  }


  timeChange(time) {
    console.log(Number(time.substring(0, 2)));
    console.log(Number(time.substring(3)));
    this.chosenHours = Number(time.substring(0, 2));
    this.chosenMinutes = Number(time.substring(3));
  }

  addNotifications(idValue, titleValue, textValue) {
    let firstNotificationTime = new Date();
    firstNotificationTime.setHours(this.chosenHours);
    firstNotificationTime.setMinutes(this.chosenMinutes);
    console.log(firstNotificationTime);
    let notification = {
      id: idValue,
      title: titleValue,
      text: textValue,
      at: firstNotificationTime
    };
    this.localNotifications.schedule(notification);
    if (this.platform.is('cordova')) {

    }
  }

  toggleSection(i) {
    this.lightItems[i].open = !this.lightItems[i].open;
  }

  unsafePublish(topic: string, message: string) {
    this._mqttService.unsafePublish(topic, message, { qos: 1, retain: true });
  }

  updatelight(light, status) {
    if (status) {
      this.lightvalue[light] = true;
      this.unsafePublish("light"+light.toString(), '1');
    } else {
      this.lightvalue[light] = false;
      this.unsafePublish("light"+light.toString(), '0');
    }
  }

  alllighttoggle() {
    if ((this.lightvalue[1] || this.lightvalue[2] || this.lightvalue[3] || this.lightvalue[4]) == true) {
      this.lightvalue[1] = true;
      this.lightvalue[2] = true;
      this.lightvalue[3] = true;
      this.lightvalue[4] = true;
    }
    this.lightvalue[1] = !this.lightvalue[1];
    this.lightvalue[2] = !this.lightvalue[2];
    this.lightvalue[3] = !this.lightvalue[3];
    this.lightvalue[4] = !this.lightvalue[4];
    this.updatelight(1, this.lightvalue[1])
    this.updatelight(2, this.lightvalue[2])
    this.updatelight(3, this.lightvalue[3])
    this.updatelight(4, this.lightvalue[4])
  }

  async setOnLight(light) {
    const alert = await this.alertController.create({
      header: 'Set Time',
      subHeader: 'On Time',
      inputs: [
        {
          name: 'ontime',
          type: 'time',
          value: this.ontime[light]
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: settime => {
            this.ontime[light] = settime.ontime;
            this.timeChange(this.ontime[light]);
            this.addNotifications(light, 'Light ' + light.toString() + ' is on', 'at ' + this.ontime[light]);
          }
        }
      ]
    });

    await alert.present();
  }

  async setOffLight(light) {
    const alert = await this.alertController.create({
      header: 'Set Time',
      subHeader: 'Off Time',
      inputs: [
        {
          name: 'offtime',
          type: 'time',
          value: this.offtime[light]
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: settime => {
            this.offtime[light] = settime.offtime;
            this.timeChange(this.offtime[light]);
            this.addNotifications(light, 'Light ' + light.toString() + ' is off', 'at ' + this.offtime[light]);
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnInit() {
    this.storage.ready().then(() => {
      this.storage.forEach((value, key) => {
        console.log(value, key);
        if (key == 'lightvalue') {
          this.lightvalue = value;
        }
        if (key == 'ontime') {
          this.ontime = value;
        }
        if (key == 'offtime') {
          this.offtime = value;
        }
      });
    });
  }

  ngOnDestroy() {
    this.storage.set('lightvalue', this.lightvalue);
    this.storage.set('ontime', this.ontime);
    this.storage.set('offtime', this.offtime);
  }
}