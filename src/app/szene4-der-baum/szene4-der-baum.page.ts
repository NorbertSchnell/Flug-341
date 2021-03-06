import { Component, OnInit } from '@angular/core';
import { SoundController } from '../classes/SoundController';
import { DeviceOrientation, DeviceOrientationCompassHeading } from '@ionic-native/device-orientation/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { Platform, NavController, LoadingController } from '@ionic/angular';
import { timer } from 'rxjs';
import { Storage } from '@ionic/storage';
import { ActivatedRoute } from '@angular/router';
import { Insomnia } from '@ionic-native/insomnia/ngx';

@Component({
  selector: 'app-szene4-der-baum',
  templateUrl: './szene4-der-baum.page.html',
  styleUrls: ['./szene4-der-baum.page.scss'],
})
export class Szene4DerBaumPage implements OnInit {
  linkNextPage = "/szene5-ende";

  skipButtonActive = false;

  soundController;
  timersubscription;
  interaktionSub;
  subscrib
  currentDuration;
  currentTimer;
  subscription;

  currentSoundIndex = 1;
  maxSoundIndex: number;
  initheading = 0;
  heading = 0;

  showInteraktion = false;
  showSecondInteraktion = false;

  constructor(protected deviceOrientation: DeviceOrientation, public platform: Platform, public loadingController: LoadingController, public vibration: Vibration, private router: NavController, private storage: Storage, private insomnia: Insomnia) {

  }

  async sceneLoading(index, dur) {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      message: 'Lade Szene',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    await loading.present();      //called when Loader is shown
    await this.soundController.initSounds(); //load all Soundbuffer
    await loading.dismiss(); //called when Loader is Dismissed

    this.startScene(index);
  }

  ngOnInit() {
    this.platform.ready().then(() => {

      // Watch Device Orientation
      this.subscription = this.deviceOrientation.watchHeading().subscribe(
        (data: DeviceOrientationCompassHeading) => {
          this.heading = data.magneticHeading;
        },
      );

      this.soundController = new SoundController(this.deviceOrientation, 5);
      this.soundController.initController();
      //get Initheading
      this.storage.get('initheading').then((val) => {
        this.soundController.setinitHeading(val);
        this.initheading = val;
      });
      this.maxSoundIndex = this.soundController.soundArray.length - 1;
      //pause when tapping out of app
      this.platform.pause.subscribe(() => {
        this.pauseGame();
        console.log("pause");
      });

      //continue when tapping into app
      this.platform.resume.subscribe(() => {
        this.unpauseGame();
      });

      //keep Phone awake
      this.insomnia.keepAwake()
        .then(
          () => console.log('success'),
          () => console.log('error')
        );
    });
  }

  ionViewDidEnter() {
    this.sceneLoading(this.currentSoundIndex, 2000);

  }

  async skip() {
    if (this.skipButtonActive) {
      this.skipButtonActive = false;
      if (this.currentSoundIndex == 2) {
        this.currentSoundIndex++;
        this.currentDuration = this.soundController.getDuration(this.currentSoundIndex);
        this.soundController.playSound(this.currentSoundIndex);
        this.startTimerforNextSound(this.currentDuration, true);
      } else if (this.currentSoundIndex == 4 || this.currentSoundIndex == 5) {
        this.currentSoundIndex = 6;
        this.currentDuration = this.soundController.getDuration(this.currentSoundIndex);
        this.soundController.playSound(this.currentSoundIndex);
        this.startTimerforNextSound(this.currentDuration, false, true);
        this.soundController.crossfade(8, 9, 10);
      } else if (this.currentSoundIndex == 7) {
        this.closeSite();
      } else {
        this.currentSoundIndex++;
        this.startNextSound(this.currentSoundIndex);
      }
    }
  }

  async wait(duration: number){
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), ((duration * 1000)));
    });
    await promise;
    return true;
  }

  pauseGame = () => {
    this.stopTimer();
    this.soundController.stopSound(0);
    this.soundController.stopSound(this.currentSoundIndex);
  }

  unpauseGame = () => {
    window.location.reload();
  }

  stopTimer() {
    this.timersubscription.unsubscribe();
    console.log("timer stoped")
  }

  startTimerforNextSound(timerlength: number, interaktion = false, staticInteraktion = false) {
    console.log(timerlength);
    this.currentTimer = timer(timerlength * 1000);
    if (!interaktion && !staticInteraktion) {
      this.timersubscription = this.currentTimer.subscribe(() => {
        this.skipButtonActive = true;
        this.timersubscription.unsubscribe();
      });
    } else if (staticInteraktion == true) {
      this.timersubscription = this.currentTimer.subscribe(() => {
        this.showSecondInteraktion = true;
        this.vibration.vibrate(500);
        this.timersubscription.unsubscribe();
      });
    } else {
      this.timersubscription = this.currentTimer.subscribe(() => {
        this.showInteraktion = true;
        this.vibration.vibrate(500);
        this.startInteractionTimer();
        this.timersubscription.unsubscribe();
      });
    }
  }

  async startScene(index) {
    this.initheading = this.soundController.initheading;
    this.soundController.playSound(0);
    this.startNextSound(index);
    await this.wait(110);
    this.soundController.crossfade(0, 8, 18);
  }

  startInteractionTimer() {
    const interaktionTimer = timer(10000);
    this.interaktionSub = interaktionTimer.subscribe(() => {
      this.showInteraktion = false;
      this.currentSoundIndex = 5;
      this.startNextSound(this.currentSoundIndex);
      this.interaktionSub.unsubscribe();
    });
  }

  closeSite() {
    this.soundController.stopAllSounds();
    this.soundController.onDestroy();
    this.soundController = null;
    this.timersubscription.unsubscribe();
    this.subscription.unsubscribe();

    //allow Sleepmode
    this.insomnia.allowSleepAgain()
      .then(
        () => console.log('success'),
        () => console.log('error')
      );
    this.router.navigateRoot(this.linkNextPage);
  }

  onClickHandler() {
    this.interaktionSub.unsubscribe();
    this.showInteraktion = false;
    this.currentSoundIndex = 4;
    this.startNextSound(this.currentSoundIndex);
  }

  secondOnClickHandler() {
    this.currentSoundIndex++;
    this.startNextSound(this.currentSoundIndex);
    this.showSecondInteraktion = false;
  }

  startNextSound(index) {
    this.currentDuration = this.soundController.getDuration(index);
    this.soundController.playSound(index);
    this.startTimerforNextSound(this.currentDuration);
  }
}
