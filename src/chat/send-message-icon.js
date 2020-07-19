import { h, Component } from 'preact';

export default class SendMessageIcon extends Component {
  render({ color, className, onClick }, {}) {
    return (
      <div className={className} onClick={onClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 19.46 16.97" fill={color}>
          <g>
            <path d="M1.4,16.88,18.85,9.4a1,1,0,0,0,0-1.84L1.4.08A1,1,0,0,0,0,1V5.6a2,2,0,0,0,.25.66,2,2,0,0,0,.62.67A22.78,22.78,0,0,0,3.61,8.48L.87,10.13a1.79,1.79,0,0,0-.62.57,1.61,1.61,0,0,0-.25.66V16A1,1,0,0,0,1.4,16.88Z" />
          </g>
        </svg>
      </div>
    );
  }
}
