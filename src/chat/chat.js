import * as store from 'store';
import io from 'socket.io-client';

import { h, Component } from 'preact';
import MessageArea from './message-area';
import SendMessageIcon from './send-message-icon';

export default class Chat extends Component {
  autoResponseState = 'pristine'; // pristine, set or canceled
  autoResponseTimer = 0;

  constructor(props) {
    super(props);
    if (store.enabled) {
      this.messagesKey = 'messages' + '.' + props.chatId + '.' + props.host;
      this.state.messages = store.get(this.messagesKey) || store.set(this.messagesKey, []);
    } else {
      this.state.messages = [];
    }
  }

  componentDidMount() {
    this.socket = io.connect();
    this.socket.on('connect', () => {
      this.socket.emit('register', {
        chatId: this.props.chatId,
        userId: this.props.userId,
      });
    });

    this.socket.on(this.props.chatId + '-' + this.props.userId, this.incomingMessage);

    if (!this.state.messages.length) {
      this.writeToMessages({
        text: this.props.conf.introMessage,
        from: 'admin',
      });
    }
  }

  render({}, state) {
    if (!state.visitorName) {
      return (
        <div>
          {this.props.conf.welcomeMessage && <div className="welcome-box">{this.props.conf.welcomeMessage}</div>}
          <input
            class="textarea"
            type="text"
            key="visitorName"
            ref={(input) => {
              this.nameInput = input;
            }}
            placeholder={this.props.conf.namePlaceholderText}
            onKeyUp={this.handleNameKeyup}
          />
          <SendMessageIcon
            className="send-message-button"
            color={this.props.conf.mainColor}
            onClick={this.updateName}
          ></SendMessageIcon>
        </div>
      );
    }

    return (
      <div>
        <MessageArea messages={state.messages} conf={this.props.conf} />

        <input
          class="textarea"
          type="text"
          key="message"
          placeholder={this.props.conf.placeholderText}
          ref={(input) => {
            this.input = input;
          }}
          onKeyPress={this.handleKeyPress}
        />
        <SendMessageIcon
          className="send-message-button"
          color={this.props.conf.mainColor}
          onClick={this.sendMessage}
        ></SendMessageIcon>

        <a class="banner" href="https://github.com/idoco/intergram" target="_blank">
          Powered by <b>Intergram</b>&nbsp;
        </a>
      </div>
    );
  }

  handleNameKeyup = (e) => {
    if (e.keyCode !== 13) {
      return;
    }
    this.updateName();
  };

  updateName = () => {
    if (!this.nameInput || !this.nameInput.value) {
      return;
    }
    let name = this.nameInput.value;
    this.setState({ visitorName: name });
  };

  handleKeyPress = (e) => {
    if (e.keyCode !== 13) {
      return;
    }
    this.sendMessage();
  };

  sendMessage = () => {
    if (!this.input || !this.input.value) {
      return;
    }
    let text = this.input.value;
    this.socket.send({
      text,
      from: 'visitor',
      visitorName: this.state.visitorName,
    });
    this.input.value = '';

    if (this.autoResponseState === 'pristine') {
      setTimeout(() => {
        this.writeToMessages({
          text: this.props.conf.autoResponse,
          from: 'admin',
        });
      }, 500);

      this.autoResponseTimer = setTimeout(() => {
        this.writeToMessages({
          text: this.props.conf.autoNoResponse,
          from: 'admin',
        });
        this.autoResponseState = 'canceled';
      }, 60 * 1000);
      this.autoResponseState = 'set';
    }
  };

  incomingMessage = (msg) => {
    this.writeToMessages(msg);
    if (msg.from === 'admin') {
      document.getElementById('messageSound').play();

      if (this.autoResponseState === 'pristine') {
        this.autoResponseState = 'canceled';
      } else if (this.autoResponseState === 'set') {
        this.autoResponseState = 'canceled';
        clearTimeout(this.autoResponseTimer);
      }
    }
  };

  writeToMessages = (msg) => {
    msg.time = new Date();
    this.setState({
      message: this.state.messages.push(msg),
    });

    if (store.enabled) {
      try {
        store.transact(this.messagesKey, function (messages) {
          messages.push(msg);
        });
      } catch (e) {
        console.log('failed to add new message to local storage', e);
        store.set(this.messagesKey, []);
      }
    }
  };
}
