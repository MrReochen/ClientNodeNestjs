import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
const { spawn, spawnSync } = require('child_process');
const totp = require('totp-generator');
import { lastValueFrom } from 'rxjs';
import { resolve } from 'path';


@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async bonjour(server: string) {
    const py_s = spawnSync('python3', [process.env.AUTOBOT_PATH, JSON.stringify({
      "worker": "general",
      "function": "getInfo",
      "data": JSON.stringify({})
    })]); 

    if (py_s.stderr.toString() !== '') {
      console.log(py_s.stderr.toString());
      return "Python Error, please debug codes!"
    }
    
    let res2send = JSON.parse(py_s.stdout.toString());
    res2send.res.country_id = process.env.COUNTRY_ID;
    res2send.res.client_ip = process.env.CLIENT_IP;
    res2send.res.client_port = process.env.CLIENT_PORT;
    
    let ts = Date.parse(new Date().toString());
    let sr = await lastValueFrom(
      this.httpService.post(server, {
        res: res2send,
        client_tag: process.env.CLIENT_TAG,
        timestamp: ts,
        token: totp(process.env.SEVER_CLENT_TALKING_TOKEN, { timestamp: ts})
      })
    )
    .then(res => res.data)
    .catch(err => {
      console.log(err);
    });
    return sr;
  }

  async work(command: any): Promise<any> {
    if (totp(process.env.SEVER_CLENT_TALKING_TOKEN, { timestamp: command.timestamp}) === command.token) {
      let py_s = spawnSync('python3', [process.env.AUTOBOT_PATH, JSON.stringify({
        "worker": command.worker,
        "function": command.function,
        "data": command.data
      })]);

      if (py_s.stderr.toString() !== '') {
        console.log(py_s.stderr.toString());
        return "Python Error, please debug codes!"
      }

      return JSON.parse(py_s.stdout.toString());
    }
    return "No Authorized!";
  }
}
