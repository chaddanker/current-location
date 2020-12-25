import { io } from 'socket.io-client';
import keys from '../config/keys';

export const socket = io(keys.socketUri);
