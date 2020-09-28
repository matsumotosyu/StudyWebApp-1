import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import {getUserDetail} from '../Actions/UserAction'
import {getProfile, updateProfile, tagRegister, tagGood, tagBad, tagReactionDelete} from '../Actions/PnetAction'

import GlobalNav from '../Components/GlobalNav'
import Indicator from '../Components/Indicator'
import ProfileCardMini from '../Components/Pnet/ProfileCardMini'
import TagList from '../Components/Pnet/TagList'
import CareerList from '../Components/Pnet/CareerList'
import HobbyList from '../Components/Pnet/HobbyList'
import ProfileEditDialog from '../Components/Pnet/Dialog/ProfileEditDialog'
import TagEditDialog from '../Components/Pnet/Dialog/TagEditDialog'
import Message, {msgType} from '../Components/Message'

type State = {
  loginUserInfo: {
    id: string;
    name: string;
    image: string;
    email: string;
  } | null;
  msgInfo: {
    value: string;
    type: msgType;
  } | null;
  pnetUserInfo: PnetUserInfo | null;
  showIndicator: boolean;
  showProfileEdit: boolean;
  editTagData: TagEditType | null;
  isShowWarningEditTagDialog: boolean;
}

class PnetPage extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      loginUserInfo: null,
      msgInfo: null,
      pnetUserInfo: null,
      showIndicator: false,
      showProfileEdit: false,
      editTagData: null,
      isShowWarningEditTagDialog: false
    };
    this.onClickProfileEdit = this.onClickProfileEdit.bind(this);
    this.closeProfileEditDialog = this.closeProfileEditDialog.bind(this);
    this.submitPeofile = this.submitPeofile.bind(this);
    this.onClickTagNew = this.onClickTagNew.bind(this);
    this.closeTagEditDialog = this.closeTagEditDialog.bind(this);
    this.registerTag = this.registerTag.bind(this);
    this.tagReactionClick = this.tagReactionClick.bind(this);
    this.updateTagReaction = this.updateTagReaction.bind(this);
    this.tagReactionDelete = this.tagReactionDelete.bind(this);
  }

  getToken() {
    const cookies = document.cookie;
    const token = cookies.split(';').find(row => row.startsWith('my-token'))?.split('=')[1];
    return token;
  }

  async componentDidMount() {
    this.setState({
      showIndicator: true
    })
    const token = this.getToken()
    if (!token) {
        this.props.history.push('/error/401-unauthorized');
      return;
    }
    let responce;
    try {
      responce = await Promise.all([
        getUserDetail(token),
        getProfile(token)
      ]);
    }
    catch (e) {
      if (e instanceof Error) {
        if (e.message.startsWith('【Pnet-E001】')) {
          console.log('登録画面へ遷移')
          this.props.history.push('/home');
          return;
        }
        console.error(e.message);
        this.props.history.push('/error/500-internal-server-error');
        return;
      } else {
        throw e;
      }
    };
    if (!responce) {
      this.props.history.push('/error/500-internal-server-error');
      return
    }

    const loginUserInfo = responce[0];
    const userProfile = responce[1]

    if (typeof loginUserInfo === 'undefined') {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    if (typeof userProfile === 'undefined') {
      this.props.history.push('/error/500-internal-server-error');
      return;
    }

    this.setState({
      loginUserInfo: loginUserInfo,
      pnetUserInfo: userProfile,
      showIndicator: false
    })
  }

  onClickProfileEdit() {
    this.setState({
      showProfileEdit: true
    })
  }

  closeProfileEditDialog(){
    this.setState({
      showProfileEdit: false
    })
  }

  async submitPeofile(profile: PnetProfileEditInfo) {
    this.setState({
      showIndicator: true
    });
    const token = this.getToken()
    if (!token) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    try {
      await updateProfile(token, profile);
    }
    catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        const msgType:msgType = 'error';
        const errInfo = {
          type: msgType,
          value: e.message
        }
        this.setState({
          msgInfo: errInfo,
          showProfileEdit: false,
          showIndicator: false
        });
        return;
      } else {
        throw e;
      }
    };

    let pnetProfile: PnetUserInfo
    try {
      pnetProfile = await getProfile(token);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        this.props.history.push('/error/500-internal-server-error');
        return;
      } else {
        throw e;
      }
    }

    const msgType:msgType = 'info';
    const msgInfo = {
      type: msgType,
      value: 'プロフィールを更新しました。'
    }
    this.setState({
      msgInfo: msgInfo,
      pnetUserInfo: pnetProfile,
      showProfileEdit: false,
      showIndicator: false
    });
    setTimeout(() => {
      this.setState({
        msgInfo: null
      })
    }, 5000);
  }

  onClickTagNew() {
    const tagData:TagEditType = {
      reaction: 'good'
    }
    this.setState({
      editTagData: tagData
    })
  }

  closeTagEditDialog(){
    this.setState({
      editTagData: null,
      isShowWarningEditTagDialog: false
    })
  }

  async registerTag(tag: TagEditType) {
    if (!tag.title) {
      const msgType:msgType = 'error';
      const msgInfo = {
        type: msgType,
        value: "タイトルが入力されていません。"
      }
      this.setState({
        msgInfo: msgInfo,
      });
      return;
    }
    if (this.state.loginUserInfo === null) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    if (this.state.pnetUserInfo === null) {
      return;
    }
    const tagData: TagRegister = {
      tag_id: '',
      action_user_id: this.state.loginUserInfo.id,
      tag_user_id: this.state.pnetUserInfo.id,
      comment: tag.comment ? tag.comment : '',
      reaction: tag.reaction,
      title: tag.title
    }

    this.setState({
      showIndicator: true
    });
    const token = this.getToken()
    if (!token) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    try {
      await tagRegister(token, tagData);
    }
    catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        const msgType:msgType = 'error';
        const errInfo = {
          type: msgType,
          value: e.message
        }
        this.setState({
          msgInfo: errInfo,
          editTagData: null,
          showIndicator: false
        });
        return;
      } else {
        throw e;
      }
    };

    let pnetProfile: PnetUserInfo
    try {
      pnetProfile = await getProfile(token);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        this.props.history.push('/error/500-internal-server-error');
        return;
      } else {
        throw e;
      }
    }

    const msgType:msgType = 'info';
    const msgInfo = {
      type: msgType,
      value: `「${tagData.title}」を追加しました。`
    }
    this.setState({
      msgInfo: msgInfo,
      pnetUserInfo: pnetProfile,
      editTagData: null,
      showIndicator: false
    });
    setTimeout(() => {
      this.setState({
        msgInfo: null
      })
    }, 5000);
  }

  tagReactionClick(tag: Tag, reaction: tagReactionType) {
    if (this.state.loginUserInfo === null) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    const loginUserInfo = this.state.loginUserInfo;
    let currentState:tagReactionType|'none' = 'none';
    type Reaction = {
      user_id: string;
      comment?: string;
    }
    let currentData:Reaction = {
      user_id: this.state.loginUserInfo.id,
    };
    const tagGood = tag.good.find((v) => {return v.user_id === loginUserInfo.id});
    if (!tagGood) {
      const tagBad = tag.bad.find((v) => {return v.user_id === loginUserInfo.id});
      if (tagBad) {
        currentState = 'bad';
        currentData = tagBad;
      }
    } else {
      currentState = 'good';
      currentData = tagGood;
    }

    const isWarn = currentState !== 'none' && currentState !== reaction

    const tagData: TagEditType = currentState !== 'none' ?{
      id: tag.id,
      comment: currentData.comment,
      reaction: reaction,
      title: tag.title
    } : {
      id: tag.id,
      reaction: reaction,
      title: tag.title
    }

    this.setState({
      editTagData: tagData,
      isShowWarningEditTagDialog: isWarn
    })
  }

  async updateTagReaction(tagReaction: TagEditType) {
    if (this.state.loginUserInfo === null) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    if (this.state.pnetUserInfo === null) {
      return;
    }
    if (!tagReaction.id) {
      const msgType:msgType = 'error';
      const msgInfo = {
        type: msgType,
        value: "IDの取得に失敗しました。"
      }
      this.setState({
        msgInfo: msgInfo,
      });
      return;
    }
    const TagReactionUpdate:TagReactionUpdate = {
      tag_id: tagReaction.id,
      action_user_id: this.state.loginUserInfo.id,
      comment: tagReaction.comment ? tagReaction.comment : '',
      reaction: tagReaction.reaction
    }

    this.setState({
      showIndicator: true
    });
    const token = this.getToken()
    if (!token) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    try {
      if (TagReactionUpdate.reaction === 'good') {
        await tagGood(token, TagReactionUpdate);
      } else {
        await tagBad(token, TagReactionUpdate);
      }
    }
    catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        const msgType:msgType = 'error';
        const errInfo = {
          type: msgType,
          value: e.message
        }
        this.setState({
          msgInfo: errInfo,
          editTagData: null,
          showIndicator: false,
          isShowWarningEditTagDialog: false
        });
        return;
      } else {
        throw e;
      }
    };

    let pnetProfile: PnetUserInfo
    try {
      pnetProfile = await getProfile(token);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        this.props.history.push('/error/500-internal-server-error');
        return;
      } else {
        throw e;
      }
    }

    const msgType:msgType = 'info';
    const msgInfo = {
      type: msgType,
      value: `「${tagReaction.title}」へリアクションしました。`
    }
    this.setState({
      msgInfo: msgInfo,
      pnetUserInfo: pnetProfile,
      editTagData: null,
      showIndicator: false,
      isShowWarningEditTagDialog: false
    });
    setTimeout(() => {
      this.setState({
        msgInfo: null
      })
    }, 5000);
  }

  async tagReactionDelete(tagId: string) {
    if (this.state.loginUserInfo === null) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }
    if (this.state.pnetUserInfo === null) {
      return;
    }
    this.setState({
      showIndicator: true
    });
    const token = this.getToken()
    if (!token) {
      this.props.history.push('/error/401-unauthorized');
      return;
    }

    try {
      await tagReactionDelete(token, tagId, this.state.loginUserInfo.id);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        const msgType:msgType = 'error';
        const errInfo = {
          type: msgType,
          value: e.message
        }
        this.setState({
          msgInfo: errInfo,
          editTagData: null,
          showIndicator: false,
          isShowWarningEditTagDialog: false
        });
        return;
      } else {
        throw e;
      }
    };

    let pnetProfile: PnetUserInfo
    try {
      pnetProfile = await getProfile(token);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        this.props.history.push('/error/500-internal-server-error');
        return;
      } else {
        throw e;
      }
    }

    const msgType:msgType = 'info';
    const msgInfo = {
      type: msgType,
      value: `リアクションを削除しました。`
    }

    this.setState({
      msgInfo: msgInfo,
      pnetUserInfo: pnetProfile,
      editTagData: null,
      showIndicator: false,
      isShowWarningEditTagDialog: false
    });

  }

  mkMain() {
    if (this.state.pnetUserInfo === null) {
      return '';
    }
    if (this.state.loginUserInfo === null) {
      return '';
    }

    const profileEditDialog = this.state.showProfileEdit
      ? (
          <ProfileEditDialog
            profile={this.state.pnetUserInfo}
            onClose={this.closeProfileEditDialog}
            onSubmit={this.submitPeofile}
          />
        )
      : '';

    const tagEditDialog = this.state.editTagData !== null
      ? !this.state.editTagData.id
        ? (
          <TagEditDialog
            tagData={this.state.editTagData}
            onClose={this.closeTagEditDialog}
            onSubmit={this.registerTag}
          />)
        : (
          <TagEditDialog
            tagData={this.state.editTagData}
            onClose={this.closeTagEditDialog}
            onSubmit={this.updateTagReaction}
            showWarning={this.state.isShowWarningEditTagDialog}
            onDelete={!this.state.isShowWarningEditTagDialog && this.state.editTagData.comment ? this.tagReactionDelete: undefined}
          />)
      : '';

    return (
      <div className="pnet-main">
        {this.state.msgInfo !== null ? <Message value={this.state.msgInfo.value} type={this.state.msgInfo.type} /> : ''}
        <ProfileCardMini
          profile={this.state.pnetUserInfo}
          canEdit={this.state.pnetUserInfo.id === this.state.loginUserInfo.id}
          onClickEdit={this.onClickProfileEdit}
        />
        <TagList
          loginUserId={this.state.loginUserInfo.id}
          tagList={this.state.pnetUserInfo.tag}
          onClickNew={this.onClickTagNew}
          reactionClick={this.tagReactionClick}
        />
        <HobbyList hobbyList={this.state.pnetUserInfo.hobby}/>
        <CareerList careerList={this.state.pnetUserInfo.career} />

        {profileEditDialog}
        {tagEditDialog}
      </div>
    )
  }

  render() {
    return (
      <div className="global-nav-page indicator-parent">
        <GlobalNav userInfo={this.state.loginUserInfo}/>
        {this.mkMain()}
        <Indicator show={this.state.showIndicator} />
      </div>
    )
  }
}

export default withRouter(PnetPage)