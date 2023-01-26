import { GenderEnum } from '../enums/gender.enum';

export interface IProfile {
	biography: string;
  birthday: Date;
  email: string;
  fake_account: boolean;
  firstname: string;
  gender: GenderEnum;
	geolocation: string;
	last_connected: Date;
  lastname: string;
  online: boolean;
  profile_picture: string;
  sexual_orientation: string;
  tags: string[];
  username: string;
  liked?: boolean;
	likes_back?: boolean;
	blocked?: boolean;
	pictures?: string[];
	custom_geolocation?: boolean;
}
