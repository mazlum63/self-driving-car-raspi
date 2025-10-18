export class Movement {
  leftWheel: boolean | null = null;
  rightWheel: boolean | null = null;

  constructor(isUser: boolean = false) {
    if (isUser) {
      this.addKeyboardListeners();
    }
  }

  private addKeyboardListeners() {
    document.onkeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "a":
          this.leftWheel = true;
          this.rightWheel = false;
          break;
        case "d":
          this.leftWheel = false;
          this.rightWheel = true;
          break;
        case "w":
          this.leftWheel = true;
          this.rightWheel = true;
          break;
        case "s":
          this.leftWheel = false;
          this.rightWheel = false;
          break;
      }
    };

    document.onkeyup = (event: KeyboardEvent) => {
      switch (event.key) {
        case "a":
          this.leftWheel = null;
          this.rightWheel = null;
          break;
        case "d":
          this.leftWheel = null;
          this.rightWheel = null;
          break;
        case "w":
          this.leftWheel = null;
          this.rightWheel = null;
          break;
        case "s":
          this.leftWheel = null;
          this.rightWheel = null;
          break;
      }
    };
  }
}
