import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { RestApiService } from '../rest-api.service';
import {
  IMqttMessage,
  MqttModule,
  MqttService,
  IMqttServiceOptions
} from 'ngx-mqtt';


@Component({
  selector: 'app-door',
  templateUrl: './door.page.html',
  styleUrls: ['./door.page.scss'],
})
export class DoorPage implements OnInit {
  public submessage: string;
  unlocked = false;
  agreements: boolean = false;
  checkedDate = [];
  valueDate = [];
  timeOnValue;
  timeOffValue;

  constructor(private _mqttService: MqttService, private storage: Storage, public actionSheetController: ActionSheetController, public alertController: AlertController, public api: RestApiService, public loadingController: LoadingController) {
    this._mqttService.observe('leddoor').subscribe((submessage: IMqttMessage) => {
      this.submessage = submessage.payload.toString();
      if(this.submessage == '1')
        this.unlocked = true;
      else
        this.unlocked = false;
    });
  }

  updateAgree(){
    if(this.agreements == false){
      
    }
  }

  unlockedHandler(event: boolean) {
    console.log(event);
    this.unlocked = event;
    if (event) {
      this._mqttService.unsafePublish('leddoor', '1', { qos: 1, retain: true });
    } else {
      this._mqttService.unsafePublish('leddoor', '0', { qos: 1, retain: true });
    }
  }

  async setDateTime() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Set Date and Time',
      buttons: [{
        text: 'Set Date',
        role: 'destructive',
        icon: 'calendar',
        handler: () => {
          this.dateCheckbox();
        }
      }, {
        text: 'Set Time',
        icon: 'time',
        handler: () => {
          this.setTime();
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async dateCheckbox() {
    const alert = await this.alertController.create({
      header: 'Checkbox',
      inputs: [
        {
          name: 'Sunday',
          type: 'checkbox',
          label: 'Sunday',
          value: '0',
          checked: this.checkedDate[0]
        },

        {
          name: 'Monday',
          type: 'checkbox',
          label: 'Monday',
          value: '1',
          checked: this.checkedDate[1]
        },

        {
          name: 'Tuesday',
          type: 'checkbox',
          label: 'Tuesday',
          value: '2',
          checked: this.checkedDate[2]
        },

        {
          name: 'Wednesday',
          type: 'checkbox',
          label: 'Wednesday',
          value: '3',
          checked: this.checkedDate[3]
        },

        {
          name: 'Thursday',
          type: 'checkbox',
          label: 'Thursday',
          value: '4',
          checked: this.checkedDate[4]
        },

        {
          name: 'Friday',
          type: 'checkbox',
          label: 'Friday',
          value: '5',
          checked: this.checkedDate[5]
        },

        {
          name: 'Saturday',
          type: 'checkbox',
          label: 'Saturday',
          value: '6',
          checked: this.checkedDate[6]
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
          handler: setdate => {
            var i, j: number;
            console.log(setdate);
            this.valueDate = setdate;
            for (j = 0; j <= 6; j++) {
              this.checkedDate[j] = false;
            }
            for (i = 0; i < setdate.length; i++) {
              for (j = 0; j <= 6; j++) {
                if (j.toString() == setdate[i])
                  this.checkedDate[j] = true;
              }
            }
            console.log(this.checkedDate);
            console.log('Confirm Ok');
          }
        }
      ]
    });
    await alert.present();
  }

  async setTime() {
    const alert = await this.alertController.create({
      header: 'Set Time',
      subHeader: 'On Time-Off Time',
      inputs: [
        {
          name: 'ontime',
          type: 'time',
          value: this.timeOnValue
        },
        {
          name: 'offtime',
          type: 'time',
          value: this.timeOffValue
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
            this.timeOnValue = settime.ontime;
            this.timeOffValue = settime.offtime;
            this.pubtimeChange();
            //this.addNotifications(light, 'Light ' + light.toString() + ' is on', 'at ' + this.ontime[light]);
          }
        }
      ]
    });

    await alert.present();
  }

  pubtimeChange() {
    console.log(Number(this.timeOnValue.substring(0, 2)));
    console.log(Number(this.timeOnValue.substring(3)));
    console.log(Number(this.timeOffValue.substring(0, 2)));
    console.log(Number(this.timeOffValue.substring(3)));
    var postOnData = "day=" + this.valueDate + "&hour=" + this.timeOnValue.substring(0, 2) + "&min=" + this.timeOnValue.substring(3);
    var postOffData = "day=" + this.valueDate + "&hour=" + this.timeOffValue.substring(0, 2) + "&min=" + this.timeOffValue.substring(3);
    this.sendPostRequest('set-door-on',postOnData);
    this.sendPostRequest('set-door-off',postOffData);
  }


  async sendPostRequest(path: string, data) {
    await this.api.postData(path, data)
      .subscribe(res => {
        console.log(res);
      }, err => {
        console.log(err);
      });
  }

  ngOnInit() {
    this.storage.ready().then(() => {
      this.storage.forEach((value, key) => {
        console.log(value, key);
        if (key == 'unlocked') {
          this.unlocked = value;
        }
        if (key == 'agreements') {
          this.agreements = value;
        }
        if (key == 'valueDate') {
          this.valueDate = value;
        }
        if (key == 'checkedDate') {
          this.checkedDate = value;
        }
        if (key == 'timeOnValue') {
          this.timeOnValue = value;
        }
        if (key == 'timeOffValue') {
          this.timeOffValue = value;
        }
      });
    });
  }

  ngOnDestroy() {
    this.storage.set('unlocked', this.unlocked);
    this.storage.set('agreements', this.agreements);
    this.storage.set('checkedDate', this.checkedDate);
    this.storage.set('valueDate', this.valueDate);
    this.storage.set('timeOffValue', this.timeOffValue);
    this.storage.set('timeOnValue', this.timeOnValue);
  }
}
