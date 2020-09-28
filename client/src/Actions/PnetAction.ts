import axios, {AxiosResponse} from 'axios';
import API from './ApiBase';

type ErrResponseValue = {
  detail: string
}

type ErrResponse = {
  response: AxiosResponse<ErrResponseValue>
}

export async function getProfile(token: string) {
  const responce = await axios.get<PnetUserInfo>(`${API.UrlBase}${API.Pnet.profile}`, {
    headers: {
      'my-token': token
    }}
  ).catch((e: ErrResponse) => {throw new Error(e.response.data.detail)});

  return responce.data;
}

export async function updateProfile(token: string, profile: PnetProfileEditInfo) {
  const responce = await axios.post<null>(`${API.UrlBase}${API.Pnet.profileEdit}`, profile, {
    headers: {
      'my-token': token
    }
  }).catch((e: ErrResponse) => {
    console.error(e);
    throw new Error(e.response.data.detail);
  });
  return responce.status
}

export async function tagRegister(token: string, tag: TagRegister) {
  const responce = await axios.post<null>(`${API.UrlBase}${API.Pnet.usertag}`, tag, {
    headers: {
      'my-token': token
    }
  }).catch((e: ErrResponse) => {
    console.error(e);
    throw new Error(e.response.data.detail);
  });
  return responce.status
}


export async function tagGood(token: string, tag: TagReactionUpdate) {
  const responce = await axios.post<null>(`${API.UrlBase}${API.Pnet.tagGood}`, tag, {
    headers: {
      'my-token': token
    }
  }).catch((e: ErrResponse) => {
    console.error(e);
    throw new Error(e.response.data.detail);
  });
  return responce.status
}


export async function tagBad(token: string, tag: TagReactionUpdate) {
  const responce = await axios.post<null>(`${API.UrlBase}${API.Pnet.tagBad}`, tag, {
    headers: {
      'my-token': token
    }
  }).catch((e: ErrResponse) => {
    console.error(e);
    throw new Error(e.response.data.detail);
  });
  return responce.status
}

type DeleteTagReactionParam = {
  tag_id: string;
  action_user_id: string;
}

export async function tagReactionDelete(token: string, tagId: string, actionUserId: string) {
  const responce = await axios.delete<null>(`${API.UrlBase}${API.Pnet.tagDelete}`, {
    params: {
      tag_id: tagId,
      action_user_id: actionUserId
    },
    headers: {
      'my-token': token
    }
  }).catch((e: ErrResponse) => {
    console.error(e);
    throw new Error(e.response.data.detail);
  });
  return responce.status
}