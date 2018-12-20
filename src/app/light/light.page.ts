import { Component, OnInit, ViewChild, Renderer } from '@angular/core';
import { CardContent, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Platform } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { RestApiService } from '../rest-api.service';

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
  public submessage: string[] = [];

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

  constructor(private _mqttService: MqttService, private storage: Storage, private platform: Platform, private localNotifications: LocalNotifications, public alertController: AlertController, public actionSheetController: ActionSheetController, public api: RestApiService) {
    this._mqttService.observe('light1').subscribe((submessage: IMqttMessage) => {
      this.submessage[1] = submessage.payload.toString();
      if(this.submessage[1] == '1')
        this.lightvalue[1] = true;
      else
        this.lightvalue[1] = false;
    });

    this._mqttService.observe('light2').subscribe((submessage: IMqttMessage) => {
      this.submessage[2] = submessage.payload.toString();
      if(this.submessage[2] == '1')
        this.lightvalue[2] = true;
      else
        this.lightvalue[2] = false;
    });

    this._mqttService.observe('light3').subscribe((submessage: IMqttMessage) => {
      this.submessage[3] = submessage.payload.toString();
      if(this.submessage[3] == '1')
        this.lightvalue[3] = true;
      else
        this.lightvalue[3] = false;
    });

    this._mqttService.observe('light4').subscribe((submessage: IMqttMessage) => {
      this.submessage[4] = submessage.payload.toString();
      if(this.submessage[4] == '1')
        this.lightvalue[4] = true;
      else
        this.lightvalue[4] = false;
    });

    this.notifyTime = moment(new Date()).format();

    this.chosenHours = new Date().getHours();
    this.chosenMinutes = new Date().getMinutes();
  }


  timeChange(timeOn, timeOff,lightNum) {
    console.log(Number(timeOn.substring(0, 2)));
    console.log(Number(timeOn.substring(3)));
    console.log(Number(timeOff.substring(0, 2)));
    console.log(Number(timeOff.substring(3)));
    //this.chosenHours = Number(time.substring(0, 2));
    //this.chosenMinutes = Number(time.substring(3));
    var postOnData = "light=" + lightNum.toString() + "&hour=" + timeOn.substring(0, 2) + "&min=" + timeOn.substring(3);
    var postOffData = "light=" + lightNum.toString() + "&hour=" + timeOff.substring(0, 2) + "&min=" + timeOff.substring(3);
    this.sendPostRequest('set-light-on',postOnData);
    this.sendPostRequest('set-light-off',postOffData);
  }

  async sendPostRequest(path: string, data) {
    await this.api.postData(path, data)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
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

  async setLight(light) {
    const alert = await this.alertController.create({
      header: 'Set Time',
      subHeader: 'On Time-Off Time',
      inputs: [
        {
          name: 'ontime',
          type: 'time',
          value: this.ontime[light]
        },
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
            this.ontime[light] = settime.ontime;
            this.offtime[light] = settime.offtime;
            this.timeChange(this.ontime[light],this.offtime[light], light);
            this.addNotifications(light, 'Light ' + light.toString() + ' is on', 'at ' + this.ontime[light]);
            this.addNotifications(light, 'Light ' + light.toString() + ' is off', 'at ' + this.offtime[light]);
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