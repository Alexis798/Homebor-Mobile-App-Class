import React, {Component, useState} from 'react';
import { View, ScrollView, Image, Alert, RefreshControl} from 'react-native'
import { NativeBaseProvider, Text, Button, Heading, Spinner, Slide, Alert as AlertNativeBase, VStack, HStack, Skeleton, Center, Divider } from 'native-base';

import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import Constants from 'expo-constants';


import globalStyles from '../styles/global';
import Card from '../shared/card';

import { StatusBar } from 'expo-status-bar';

import api from '../api/api';

import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from 'expo-file-system';

export default class GalleryEdit extends Component {
  NetInfoSubscription = null;

  constructor(props){
    super(props);
    this.state = {
      //User Variables 
      email : '',
      perm : false,
      info : [],
      refreshing: false,

      //Default Image
      imagehome: require('../assets/img/empty/vacios-homebor-casa.png'),
      imageliving: require('../assets/img/empty/vacios-homebor-sala.png'),
      imagefamily: require('../assets/img/empty/vacios-homebor-familia.png'),
      imagekitchen: require('../assets/img/empty/vacios-homebor-cocina.png'),
      imagedining: require('../assets/img/empty/vacios-homebor-comedor.png'),
      imagecommon1: require('../assets/img/empty/vacios-homebor-areas-recreativas.png'),
      imagecommon2: require('../assets/img/empty/vacios-homebor-areas-recreativas.png'),
      imagebath1: require('../assets/img/empty/vacios-homebor-bath.png'),
      imagebath2: require('../assets/img/empty/vacios-homebor-bath.png'),
      imagebath3: require('../assets/img/empty/vacios-homebor-bath.png'),
      imagebath4: require('../assets/img/empty/vacios-homebor-bath.png'),

      //Internet Connection
      connection_status: false,
      connection_refreshStatus: false,
      clockrun : false,

      //LoadingFirstTime
      readyDisplay : false
    }
  }

  async componentDidMount(){
    this.NetInfoSubscription = NetInfo.addEventListener( this._handleConnectivityChange )

    //Get user 
    let userLogin = await AsyncStorage.getItem('userLogin')
    userLogin = JSON.parse(userLogin)
    this.setState({ email : userLogin.email, perm : userLogin.perm})
    
    if(this.state.connection_status == true) {
      //Get photos from profile user
      let profile = await api.getGalleryPhotos(this.state.email,this.state.perm)
      this.setState({ info : profile.data, loading : false, connection_refreshStatus: false, id: profile.data[0].id_home, idm: profile.data[0].id_m, photo0: 'Yes', photo1: 'Yes', photo2: 'Yes', photo3: 'Yes', photo4: 'Yes', photo5: 'Yes', photo6: 'Yes', photo7: 'Yes', photo8: 'Yes', photo9: 'Yes', photo10: 'Yes', photo11: 'Yes', readyDisplay : true})

      //Data for cache
      let cache = await AsyncStorage.getItem('editGalleryCache')
      cache = JSON.parse(cache)
      if(JSON.stringify(cache) !== JSON.stringify(profile)) {
          await AsyncStorage.setItem('editGalleryCache',JSON.stringify(profile))
      }

      this.ImagesCache()

    } else {
      //Data for cache
      let cache = await AsyncStorage.getItem('editGalleryCache')
      cache = JSON.parse(cache)
      if(cache == null) {
          this.setState({connection_refreshStatus: true, loading : false, readyDisplay : true})
      } else {
          let profile = cache
          this.setState({ info : profile.data, loading : false, connection_refreshStatus: false, id: profile.data[0].id_home, idm: profile.data[0].id_m, photo0: 'Yes', photo1: 'Yes', photo2: 'Yes', photo3: 'Yes', photo4: 'Yes', photo5: 'Yes', photo6: 'Yes', photo7: 'Yes', photo8: 'Yes', photo9: 'Yes', photo10: 'Yes', photo11: 'Yes', readyDisplay : true})

          this.ImagesCache()
      }
    }

    //Permissions function call to access to the gallery of phone 
    this.getPermissionAsync();

    this._onFocusListener = this.props.navigation.addListener('focus', () => {
      this.onRefresh()
    });
  }

  //Permissions function to access to the gallery of phone 
  getPermissionAsync = async () => {
    if (Constants.platform.ios){
        const {status} = await Camera.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert ('It seems that you have not granted permission to access the camera, to access all the functionalities of this screen go to the configuration of your cell phone and change this.');
            
        }
    }
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.refresh().then(() => {
        this.setState({ refreshing: false });
    });
  }

  refresh = async() => {
    if(this.state.connection_status == true) {
      //Get user 
      let userLogin = await AsyncStorage.getItem('userLogin')
      userLogin = JSON.parse(userLogin)
      this.setState({ email : userLogin.email, perm : userLogin.perm})

      let profile = await api.getGalleryPhotos(this.state.email,this.state.perm)
      this.setState({ info : profile.data, connection_refreshStatus: false, id: profile.data[0].id_home, idm: profile.data[0].id_m, photo0: 'Yes', photo1: 'Yes', photo2: 'Yes', photo3: 'Yes', photo4: 'Yes', photo5: 'Yes', photo6: 'Yes', photo7: 'Yes', photo8: 'Yes', photo9: 'Yes', photo10: 'Yes', photo11: 'Yes', readyDisplay : true, loading : false})

      //Data for cache
      let cache = await AsyncStorage.getItem('editGalleryCache')
      cache = JSON.parse(cache)
      if(JSON.stringify(cache) !== JSON.stringify(profile)) {
          await AsyncStorage.setItem('editGalleryCache',JSON.stringify(profile))
      }

      this.ImagesCache()
    } else {
        //Data for cache
        let cache = await AsyncStorage.getItem('editGalleryCache')
        cache = JSON.parse(cache)
        if(cache == null) {
            this.setState({connection_refreshStatus: true, loading : false, readyDisplay : true})
        } else {
            let profile = cache
            this.setState({ info : profile.data, loading : false, connection_refreshStatus: false, id: profile.data[0].id_home, idm: profile.data[0].id_m, photo0: 'Yes', photo1: 'Yes', photo2: 'Yes', photo3: 'Yes', photo4: 'Yes', photo5: 'Yes', photo6: 'Yes', photo7: 'Yes', photo8: 'Yes', photo9: 'Yes', photo10: 'Yes', photo11: 'Yes', readyDisplay : true})

            this.ImagesCache()
        }
    }
  }

  ImagesCache = async () => {
       
    if(this.state.info[0].phome != 'NULL') {
        const phome = `YOURENDPOINT/${this.state.info[0].phome}`;
        const pathPhome = FileSystem.cacheDirectory + `${this.state.info[0].phome}`;
        const phomeImage = await FileSystem.getInfoAsync(pathPhome);
    
        if (phomeImage.exists) {
            this.setState({
                phomePhoto: {uri: phomeImage.uri}
            })

        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathPhome);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathPhome, { intermediates: true }).then(async() => {
                    const newPhomePhoto = await FileSystem.downloadAsync(phome, pathPhome)
                    this.setState({
                        phomePhoto: {uri: newPhomePhoto.uri}
                    })

                });
            } else {
                const newPhomePhoto = await FileSystem.downloadAsync(phome, pathPhome)
                    this.setState({
                        phomePhoto: {uri: newPhomePhoto.uri}
                    })

            }
        }

    }

    if(this.state.info[0].pliving != 'NULL') {
        const pliving = `YOURENDPOINT/${this.state.info[0].pliving}`;
        const pathPliving = FileSystem.cacheDirectory + `${this.state.info[0].pliving}`;
        const plivingImage = await FileSystem.getInfoAsync(pathPliving);
        
        if (plivingImage.exists) {
            this.setState({
                plivingPhoto: {uri: plivingImage.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathPliving);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathPliving, { intermediates: true }).then(async() => {
                    const newplivingPhoto = await FileSystem.downloadAsync(pliving, pathPliving)
                    this.setState({
                        plivingPhoto: {uri: newplivingPhoto.uri}
                    })
                });
    
            } else {
                const newPlivingPhoto = await FileSystem.downloadAsync(pliving, pathPliving)
                    this.setState({
                        plivingPhoto: {uri: newPlivingPhoto.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].parea1 != 'NULL') {
        const parea1 = `YOURENDPOINT/${this.state.info[0].parea1}`;
        const pathParea1 = FileSystem.cacheDirectory + `${this.state.info[0].parea1}`;
        const parea1Image = await FileSystem.getInfoAsync(pathParea1);
        
        if (parea1Image.exists) {
            this.setState({
                parea1Photo: {uri: parea1Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathParea1);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathParea1, { intermediates: true }).then(async() => {
                    const newparea1Photo = await FileSystem.downloadAsync(parea1, pathParea1)
                    this.setState({
                        parea1Photo: {uri: newparea1Photo.uri}
                    })
                });
    
            } else {
                const newParea1Photo = await FileSystem.downloadAsync(parea1, pathParea1)
                    this.setState({
                        parea1Photo: {uri: newParea1Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].parea2 != 'NULL') {
        const parea2 = `YOURENDPOINT/${this.state.info[0].parea2}`;
        const pathParea2 = FileSystem.cacheDirectory + `${this.state.info[0].parea2}`;
        const parea2Image = await FileSystem.getInfoAsync(pathParea2);
        
        if (parea2Image.exists) {
            this.setState({
                parea2Photo: {uri: parea2Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathParea2);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathParea2, { intermediates: true }).then(async() => {
                    const newparea2Photo = await FileSystem.downloadAsync(parea2, pathParea2)
                    this.setState({
                        parea2Photo: {uri: newparea2Photo.uri}
                    })
                });
    
            } else {
                const newParea2Photo = await FileSystem.downloadAsync(parea2, pathParea2)
                    this.setState({
                        parea2Photo: {uri: newParea2Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].parea3 != 'NULL') {
        const parea3 = `YOURENDPOINT/${this.state.info[0].parea3}`;
        const pathParea3 = FileSystem.cacheDirectory + `${this.state.info[0].parea3}`;
        const parea3Image = await FileSystem.getInfoAsync(pathParea3);
        
        if (parea3Image.exists) {
            this.setState({
                parea3Photo: {uri: parea3Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathParea3);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathParea3, { intermediates: true }).then(async() => {
                    const newparea3Photo = await FileSystem.downloadAsync(parea3, pathParea3)
                    this.setState({
                        parea3Photo: {uri: newparea3Photo.uri}
                    })
                });
    
            } else {
                const newParea3Photo = await FileSystem.downloadAsync(parea3, pathParea3)
                    this.setState({
                        parea3Photo: {uri: newParea3Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].parea4 != 'NULL') {
        const parea4 = `YOURENDPOINT/${this.state.info[0].parea4}`;
        const pathParea4 = FileSystem.cacheDirectory + `${this.state.info[0].parea4}`;
        const parea4Image = await FileSystem.getInfoAsync(pathParea4);
        
        if (parea4Image.exists) {
            this.setState({
                parea4Photo: {uri: parea4Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathParea4);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathParea4, { intermediates: true }).then(async() => {
                    const newparea4Photo = await FileSystem.downloadAsync(parea4, pathParea4)
                    this.setState({
                        parea4Photo: {uri: newparea4Photo.uri}
                    })
                });
    
            } else {
                const newParea4Photo = await FileSystem.downloadAsync(parea4, pathParea4)
                    this.setState({
                        parea4Photo: {uri: newParea4Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].pbath1 != 'NULL') {
        const pbath1 = `YOURENDPOINT/${this.state.info[0].pbath1}`;
        const pathPbath1 = FileSystem.cacheDirectory + `${this.state.info[0].pbath1}`;
        const pbath1Image = await FileSystem.getInfoAsync(pathPbath1);
        
        if (pbath1Image.exists) {
            this.setState({
                pbath1Photo: {uri: pbath1Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathPbath1);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathPbath1, { intermediates: true }).then(async() => {
                    const newpbath1Photo = await FileSystem.downloadAsync(pbath1, pathPbath1)
                    this.setState({
                        pbath1Photo: {uri: newpbath1Photo.uri}
                    })
                });
    
            } else {
                const newPbath1Photo = await FileSystem.downloadAsync(pbath1, pathPbath1)
                    this.setState({
                        pbath1Photo: {uri: newPbath1Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].pbath2 != 'NULL') {
        const pbath2 = `YOURENDPOINT/${this.state.info[0].pbath2}`;
        const pathPbath2 = FileSystem.cacheDirectory + `${this.state.info[0].pbath2}`;
        const pbath2Image = await FileSystem.getInfoAsync(pathPbath2);
        
        if (pbath2Image.exists) {
            this.setState({
                pbath2Photo: {uri: pbath2Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathPbath2);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathPbath2, { intermediates: true }).then(async() => {
                    const newpbath2Photo = await FileSystem.downloadAsync(pbath2, pathPbath2)
                    this.setState({
                        pbath2Photo: {uri: newpbath2Photo.uri}
                    })
                });
    
            } else {
                const newPbath2Photo = await FileSystem.downloadAsync(pbath2, pathPbath2)
                    this.setState({
                        pbath2Photo: {uri: newPbath2Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].pbath3 != 'NULL') {
        const pbath3 = `YOURENDPOINT/${this.state.info[0].pbath3}`;
        const pathPbath3 = FileSystem.cacheDirectory + `${this.state.info[0].pbath3}`;
        const pbath3Image = await FileSystem.getInfoAsync(pathPbath3);
        
        if (pbath3Image.exists) {
            this.setState({
                pbath3Photo: {uri: pbath3Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathPbath3);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathPbath3, { intermediates: true }).then(async() => {
                    const newpbath3Photo = await FileSystem.downloadAsync(pbath3, pathPbath3)
                    this.setState({
                        pbath3Photo: {uri: newpbath3Photo.uri}
                    })
                });
    
            } else {
                const newPbath3Photo = await FileSystem.downloadAsync(pbath3, pathPbath3)
                    this.setState({
                        pbath3Photo: {uri: newPbath3Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].pbath4 != 'NULL') {
        const pbath4 = `YOURENDPOINT/${this.state.info[0].pbath4}`;
        const pathPbath4 = FileSystem.cacheDirectory + `${this.state.info[0].pbath4}`;
        const pbath4Image = await FileSystem.getInfoAsync(pathPbath4);
        
        if (pbath4Image.exists) {
            this.setState({
                pbath4Photo: {uri: pbath4Image.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathPbath4);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathPbath4, { intermediates: true }).then(async() => {
                    const newpbath4Photo = await FileSystem.downloadAsync(pbath4, pathPbath4)
                    this.setState({
                        pbath4Photo: {uri: newpbath4Photo.uri}
                    })
                });
    
            } else {
                const newPbath4Photo = await FileSystem.downloadAsync(pbath4, pathPbath4)
                    this.setState({
                        pbath4Photo: {uri: newPbath4Photo.uri}
                    })
                    
            }
        }
    
    }

    if(this.state.info[0].fp != 'NULL') {
        const fp = `YOURENDPOINT/${this.state.info[0].fp}`;
        const pathFp = FileSystem.cacheDirectory + `${this.state.info[0].fp}`;
        const fpImage = await FileSystem.getInfoAsync(pathFp);
        
        if (fpImage.exists) {
            this.setState({
                fpPhoto: {uri: fpImage.uri}
            })
    
        } else {
            const directoryInfo = await FileSystem.getInfoAsync(pathFp);
            if(!directoryInfo.exists) {
                await FileSystem.makeDirectoryAsync(pathFp, { intermediates: true }).then(async() => {
                    const newfpPhoto = await FileSystem.downloadAsync(fp, pathFp)
                    this.setState({
                        fpPhoto: {uri: newfpPhoto.uri}
                    })
                });
    
            } else {
                const newfpPhoto = await FileSystem.downloadAsync(fp, pathFp)
                    this.setState({
                        fpPhoto: {uri: newfpPhoto.uri}
                    })
                    
            }
        }
    
    }
    
}

  //This group of functions is used to ask to user which way prefer to catch the images, from the gallery or from the camera
  _Alerthome = async () => { 
    Alert.alert(
        'Important!',
        'We recommend to use images from the folder for more speed and integrity on the file update',
        [        
          {text: 'Camera', onPress: () => this._pickImageCamera(),},
          {text: 'Folder', onPress: () => this._pickImage()},
        ],
        { cancelable: true }
      )
  }

  _Alertliving = async () => { 
    Alert.alert(
        'Important!',
        'We recommend to use images from the folder for more speed and integrity on the file update',
        [        
          {text: 'Camera', onPress: () => this._pickImageCamera2(),},
          {text: 'Folder', onPress: () => this._pickImage2()},
        ],
        { cancelable: true }
      )
  }

  _Alertfamily = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera3(),},
            {text: 'Folder', onPress: () => this._pickImage3()},
          ],
          { cancelable: true }
        )
  }

  _Alertkitchen = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera4(),},
            {text: 'Folder', onPress: () => this._pickImage4()},
          ],
          { cancelable: true }
        )
  }

  _Alertdining = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera5(),},
            {text: 'Folder', onPress: () => this._pickImage5()},
          ],
          { cancelable: true }
        )
  }

  _Alertcommon1 = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera6(),},
            {text: 'Folder', onPress: () => this._pickImage6()},
          ],
          { cancelable: true }
        )
  }

  _Alertcommon2 = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera7(),},
            {text: 'Folder', onPress: () => this._pickImage7()},
          ],
          { cancelable: true }
        )
  }

  _Alertbath1 = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera8(),},
            {text: 'Folder', onPress: () => this._pickImage8()},
          ],
          { cancelable: true }
        )
  }

  _Alertbath2 = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera9(),},
            {text: 'Folder', onPress: () => this._pickImage9()},
          ],
          { cancelable: true }
        )
  }

  _Alertbath3 = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera10(),},
            {text: 'Folder', onPress: () => this._pickImage10()},
          ],
          { cancelable: true }
        )
  }

  _Alertbath4 = async () => { 
      Alert.alert(
          'Important!',
          'We recommend to use images from the folder for more speed and integrity on the file update',
          [        
            {text: 'Camera', onPress: () => this._pickImageCamera11(),},
            {text: 'Folder', onPress: () => this._pickImage11()},
          ],
          { cancelable: true }
        )
  }

  //_pickImageCamera is a group of functions to catch the images from the camera.
  //_pickImage is a group of functions to catch the images from the gallery folder.
  _pickImageCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
        
    });

    if(!result.canceled) {
        this.setState({
              imagehome: result.assets[0].uri
          });


    }
  }

  _pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,

          
          
      });

      if(!result.canceled) {
          this.setState({
                imagehome: result.assets[0].uri
            });


      }
  }

  _pickImage2 = async () => {
      let result2 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result2.canceled) {
          this.setState({
              imageliving: result2.assets[0].uri
            });


      }
  }

  _pickImageCamera2 = async () => {
      let result2 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result2.canceled) {
          this.setState({
              imageliving: result2.assets[0].uri
            });


      }
  }

  _pickImage3 = async () => {
      let result3 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result3.canceled) {
          this.setState({
              imagefamily: result3.assets[0].uri
            });


      }
  }

  _pickImageCamera3 = async () => {
      let result3 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result3.canceled) {
          this.setState({
              imagefamily: result3.assets[0].uri
            });


      }
  }

  _pickImage4 = async () => {
      let result4 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result4.canceled) {
          this.setState({
              imagekitchen: result4.assets[0].uri
            });


      }
  }

  _pickImageCamera4 = async () => {
      let result4 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result4.canceled) {
          this.setState({
              imagekitchen: result4.assets[0].uri
            });


      }
  }

  _pickImage5 = async () => {
      let result5 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result5.canceled) {
          this.setState({
              imagedining: result5.assets[0].uri
            });


      }
  }

  _pickImageCamera5 = async () => {
      let result5 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result5.canceled) {
          this.setState({
              imagedining: result5.assets[0].uri
            });


      }
  }

  _pickImage6 = async () => {
      let result6 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result6.canceled) {
          this.setState({
              imagecommon1: result6.assets[0].uri
            });


      }
  }

  _pickImageCamera6 = async () => {
      let result6 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result6.canceled) {
          this.setState({
              imagecommon1: result6.assets[0].uri
            });


      }
  }

  _pickImage7 = async () => {
      let result7 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result7.canceled) {
          this.setState({
              imagecommon2: result7.assets[0].uri
            });


      }
  }

  _pickImageCamera7 = async () => {
      let result7 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result7.canceled) {
          this.setState({
              imagecommon2: result7.assets[0].uri
            });


      }
  }

  _pickImage8 = async () => {
      let result8 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result8.canceled) {
          this.setState({
              imagebath1: result8.assets[0].uri
            });


      }
  }

  _pickImageCamera8 = async () => {
      let result8 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result8.canceled) {
          this.setState({
              imagebath1: result8.assets[0].uri
            });


      }

  }

  _pickImage9 = async () => {
      let result9 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });

      if(!result9.canceled) {
          this.setState({
              imagebath2: result9.assets[0].uri
            });


      }
  }

  _pickImageCamera9 = async () => {
      let result9 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });


      if(!result9.canceled) {
          this.setState({
              imagebath2: result9.assets[0].uri
            });


      }
  }

  _pickImage10 = async () => {
      let result10 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });


      if(!result10.canceled) {
          this.setState({
              imagebath3: result10.assets[0].uri
            });


      }
  }

  _pickImageCamera10 = async () => {
      let result10 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });


      if(!result10.canceled) {
          this.setState({
              imagebath3: result10.assets[0].uri
            });


      }
  }

  _pickImage11 = async () => {
      let result11 = await ImagePicker.launchImageLibraryAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });


      if(!result11.canceled) {
          this.setState({
              imagebath4: result11.assets[0].uri
            });


      }
  }

  _pickImageCamera11 = async () => {
      let result11 = await ImagePicker.launchCameraAsync({
        mediaTypes : ImagePicker.MediaTypeOptions.All,
        quality : (Platform.OS === 'ios') ? 0 : 1,
          
      });


      if(!result11.canceled) {
          this.setState({
              imagebath4: result11.assets[0].uri
            });


      }
  }

  //Function call to register the images to database 
  registerbasici = async () => {
    //Functions call to register the images to database
    let localUri = this.state.imagehome;
    if (localUri == require('../assets/img/empty/vacios-homebor-casa.png')) {} 
    else { this.registerfile1() }
    let localUri2 = this.state.imageliving;
    if (localUri2 == require('../assets/img/empty/vacios-homebor-sala.png')) {} 
    else { this.registerfile2() }
    let localUri3 = this.state.imagefamily;
    if (localUri3 == require('../assets/img/empty/vacios-homebor-familia.png')) {} 
    else { this.registerfile3() }
    let localUri4 = this.state.imagekitchen;
    if (localUri4 == require('../assets/img/empty/vacios-homebor-cocina.png')) {} 
    else { this.registerfile4() }
    let localUri5 = this.state.imagedining;
    if (localUri5 == require('../assets/img/empty/vacios-homebor-comedor.png')) {} 
    else { this.registerfile5() }
    let localUri6 = this.state.imagecommon1;
    if (localUri6 == require('../assets/img/empty/vacios-homebor-areas-recreativas.png')) {} 
    else { this.registerfile6() }
    let localUri7 = this.state.imagecommon2;
    if (localUri7 == require('../assets/img/empty/vacios-homebor-areas-recreativas.png')) {} 
    else { this.registerfile7() }
    let localUri8 = this.state.imagebath1;
    if (localUri8 == require('../assets/img/empty/vacios-homebor-bath.png')) {} 
    else { this.registerfile8() }
    let localUri9 = this.state.imagebath2;
    if (localUri9 == require('../assets/img/empty/vacios-homebor-bath.png')) {} 
    else { this.registerfile9() }
    let localUri10 = this.state.imagebath3;
    if (localUri10 == require('../assets/img/empty/vacios-homebor-bath.png')) {} 
    else { this.registerfile10() }
    let localUri11 = this.state.imagebath4;
    if (localUri11 == require('../assets/img/empty/vacios-homebor-bath.png')) {} 
    else { this.registerfile11() }
     this.registerlog()
    
  }

  //Functions to register the images to database
  registerfile1 = async () => {
    //Variable of image
    let localUri = this.state.imagehome;

    //if user don't submit this images them go to the next function
    if (localUri == null) { this.registerfile2() } 
    else {  
      //Files
      let filename = localUri.split('/').pop();
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`;

    

      let formData = new FormData();
      formData.append('photo', { uri: localUri, name: filename, type });


      //Variables
      let eMail = this.state.email;
      let id = this.state.id;
      let photo1 = this.state.photo1;

      //call to the api to register the images
      return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo1=${photo1}`, {
        method: 'POST',
        body: formData,
        header: {
            'Content-Type': 'multipart/form-data'
        },
      }).then(res => res.json())
        .catch(error => console.error('Error', error))
        .then(response => {
          if (response.status == 1) {
          }
          else {
            Alert.alert('Error with frontage photo upload')
          }
        });
    }
  };

  registerfile2 = async () => {
      let localUri2 = this.state.imageliving;

      if (localUri2 == null) { this.registerfile3() } 
      else {  
        //Files
        let filename2 = localUri2.split('/').pop();
        let match2 = /\.(\w+)$/.exec(filename2);
        let type2 = match2 ? `image/${match2[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo2', { uri: localUri2, name: filename2, type : type2 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo2 = this.state.photo2;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo2=${photo2}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with living room photo upload')
            }
          });
      }
  };

  registerfile3 = async () => {
      let localUri3 = this.state.imagefamily;

      if (localUri3 == null) { this.registerfile4() } 
      else {  
        //Files
        let filename3 = localUri3.split('/').pop();
        let match3 = /\.(\w+)$/.exec(filename3);
        let type3 = match3 ? `image/${match3[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo3', { uri: localUri3, name: filename3, type : type3 });


        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo3 = this.state.photo3;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo3=${photo3}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with family photo upload')
            }
          });
      }
  };

  registerfile4 = async () => {
      let localUri4 = this.state.imagekitchen;

      if (localUri4 == null) { this.registerfile5() } 
      else {  
        //Files
        let filename4 = localUri4.split('/').pop();
        let match4 = /\.(\w+)$/.exec(filename4);
        let type4 = match4 ? `image/${match4[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo4', { uri: localUri4, name: filename4, type : type4 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo4 = this.state.photo4;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo4=${photo4}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with kitchen photo upload')
            }
          });
      }
  };

  registerfile5 = async () => {
      let localUri5 = this.state.imagedining;

      if (localUri5 == null) { this.registerfile6() } 
      else {  
        //Files
        let filename5 = localUri5.split('/').pop();
        let match5 = /\.(\w+)$/.exec(filename5);
        let type5 = match5 ? `image/${match5[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo5', { uri: localUri5, name: filename5, type : type5 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo5 = this.state.photo5;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo5=${photo5}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with dining photo upload')
            }
          });
      }
  };

  registerfile6 = async () => {
      let localUri6 = this.state.imagecommon1;

      if (localUri6 == null) { this.registerfile7() } 
      else {  
        //Files
        let filename6 = localUri6.split('/').pop();
        let match6 = /\.(\w+)$/.exec(filename6);
        let type6 = match6 ? `image/${match6[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo6', { uri: localUri6, name: filename6, type : type6 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo6 = this.state.photo6;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo6=${photo6}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with house area 3 photo upload')
            }
          });
      }
  };

  registerfile7 = async () => {
      let localUri7 = this.state.imagecommon2;

      if (localUri7 == null) { this.registerfile8() } 
      else {  
        //Files
        let filename7 = localUri7.split('/').pop();
        let match7 = /\.(\w+)$/.exec(filename7);
        let type7 = match7 ? `image/${match7[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo7', { uri: localUri7, name: filename7, type : type7 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo7 = this.state.photo7;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo7=${photo7}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with house area 4 photo upload')
            }
          });
      }
  };

  registerfile8 = async () => {
      let localUri8 = this.state.imagebath1;

      if (localUri8 == null) { this.registerfile9() } 
      else {  
        //Files
        let filename8 = localUri8.split('/').pop();
        let match8 = /\.(\w+)$/.exec(filename8);
        let type8 = match8 ? `image/${match8[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo8', { uri: localUri8, name: filename8, type : type8 });


        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo8 = this.state.photo8;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo8=${photo8}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with bathroom 1 photo upload')
            }
          });
      }
  };

  registerfile9 = async () => {
      let localUri9 = this.state.imagebath2;

      if (localUri9 == null) { this.registerfile10() } 
      else {  
        //Files
        let filename9 = localUri9.split('/').pop();
        let match9 = /\.(\w+)$/.exec(filename9);
        let type9 = match9 ? `image/${match9[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo9', { uri: localUri9, name: filename9, type : type9 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo9 = this.state.photo9;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo9=${photo9}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with bathroom 2 photo upload')
            }
          });
      }
  };


  registerfile10 = async () => {
      let localUri10 = this.state.imagebath3;

      if (localUri10 == null) { this.registerfile11() } 
      else {  
        //Files
        let filename10 = localUri10.split('/').pop();
        let match10 = /\.(\w+)$/.exec(filename10);
        let type10 = match10 ? `image/${match10[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo10', { uri: localUri10, name: filename10, type : type10 });


        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo10 = this.state.photo10;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo10=${photo10}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with bathroom 3 photo upload')
            }
          });
      }
  };

  registerfile11 = async () => {
      let localUri11 = this.state.imagebath4;

      if (localUri11 == null) { } 
      else {  
        //Files
        let filename11 = localUri11.split('/').pop();
        let match11 = /\.(\w+)$/.exec(filename11);
        let type11 = match11 ? `image/${match11[1]}` : `image`;

      

        let formData = new FormData();
        formData.append('photo11', { uri: localUri11, name: filename11, type : type11 });

        //Variables
        let eMail = this.state.email;
        let id = this.state.id;
        let photo11 = this.state.photo11;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo11=${photo11}`, {
          method: 'POST',
          body: formData,
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
            }
            else {
              Alert.alert('Error with bathroom 4 photo upload')
            }
          });
      }
  };

  registerlog = async () => {

        let eMail = this.state.email;
        let id = this.state.id;
        let photo0 = this.state.photo0;
        let idm = this.state.idm;

        return await fetch(`YOURENDPOINT?email=${eMail}&id=${id}&photo0=${photo0}&idm=${idm}`, {
          method: 'POST',
          header: {
              'Content-Type': 'multipart/form-data'
          },
        }).then(res => res.json())
          .catch(error => console.error('Error', error))
          .then(response => {
            if (response.status == 1) {
              Alert.alert('Data Uploaded Successfully')
            }
            else {
              Alert.alert('Error')
            }
          });
  };

  _handleConnectivityChange = (state) => {
    this.setState({ connection_status: state.isConnected, clockrun : true });
    this.Clock()
  }

  Clock = () => {
    this.timerHandle = setTimeout (() => {
      this.setState({clockrun : false});
      this.timerHandle = 0;
    }, 5000)
  }

  noInternetConnection = () => {
    Alert.alert('There is no internet connection, connect and try again.')
  }

  tryAgainNotConnection = () => {
    this.setState({clockrun : true})
    this.Clock()
  }

  componentWillUnmount(){
    this.NetInfoSubscription && this.NetInfoSubscription()
    clearTimeout(this.timerHandle)
    this.timerHandle = 0;
  }

  render() {

    //Variables to get default images
    let { imagehome } = this.state;
    let { imageliving } = this.state;
    let { imagefamily } = this.state;
    let { imagekitchen } = this.state;
    let { imagedining } = this.state;
    let { imagecommon1 } = this.state;
    let { imagecommon2 } = this.state;
    let { imagebath1 } = this.state;
    let { imagebath2 } = this.state;
    let { imagebath3 } = this.state;
    let { imagebath4 } = this.state;

    return (
      <NativeBaseProvider>
        <StatusBar style="light" translucent={true} />
        <View>
          {this.state.readyDisplay == false && (
            <View style={globalStyles.skeletonMarginTop}>
                <Center w="100%">
                    <VStack w="90%" borderWidth="1" space={6} rounded="md" alignItems="center" _dark={{borderColor: "coolGray.500"}} _light={{borderColor: "coolGray.200"}}>
                        <View style={globalStyles.skeletonMarginProfileText}>
                            <HStack space="2" alignItems="center">
                                <Skeleton px="4" my="4" rounded="md" startColor="indigo.200" />
                            </HStack>
                        </View>
                        <VStack w="90%" borderWidth="1" space={8} overflow="hidden" rounded="md" _dark={{borderColor: "coolGray.500"}} _light={{borderColor: "coolGray.200"}}>
                            <HStack space="4">
                                <Skeleton h="90" w="30%" />
                                <Skeleton h="90" w="30%" />
                                <Skeleton h="90" w="30%" />
                            </HStack>
                        </VStack>
                        <VStack w="90%" borderWidth="1" space={8} overflow="hidden" rounded="md" _dark={{borderColor: "coolGray.500"}} _light={{borderColor: "coolGray.200"}}>
                            <HStack space="4">
                                <Skeleton h="90" w="30%" />
                                <Skeleton h="90" w="30%" />
                                <Skeleton h="90" w="30%" />
                            </HStack>
                        </VStack>
                        <VStack w="90%" borderWidth="1" space={8} overflow="hidden" rounded="md" _dark={{borderColor: "coolGray.500"}} _light={{borderColor: "coolGray.200"}}>
                            <HStack space="4">
                                <Skeleton h="90" w="30%" />
                                <Skeleton h="90" w="30%" />
                                <Skeleton h="90" w="30%" />
                            </HStack>
                        </VStack>
                        <Skeleton px="4" my="4" rounded="md" startColor="purple.200" />
                    </VStack>
                </Center>
            </View>
          )}

          {this.state.readyDisplay == true && (
            <View>
              {this.state.connection_refreshStatus != false && (
                <View>
                   {this.state.refreshing == true && (
                      <View style={globalStyles.spinnerRefreshInternet}>
                        <Spinner color="purple.500" style={ globalStyles.spinner} size="lg"/>
                      </View>
                    )}

                  <Slide in={!this.state.clockrun ? false : true} placement="top">
                    {this.state.connection_status ?
                      <AlertNativeBase style={globalStyles.StacknoInternetConnection}  justifyContent="center" bg="emerald.100" >
                        <VStack space={2} flexShrink={1} w="100%">
                          <HStack flexShrink={1} space={2}  justifyContent="center">
                            <Text color="emerald.600" fontWeight="medium">You are connected</Text>
                          </HStack>
                        </VStack>
                      </AlertNativeBase>
                      :
                      <AlertNativeBase style={globalStyles.StacknoInternetConnection}  justifyContent="center" status="error">
                        <VStack space={2} flexShrink={1} w="100%">
                          <HStack flexShrink={1} space={2}  justifyContent="center">
                            <Text color="error.600" fontWeight="medium">
                              <AlertNativeBase.Icon />
                              <Text> No Internet Connection</Text>
                            </Text>
                          </HStack>
                        </VStack>
                      </AlertNativeBase> 
                    }
                  </Slide>

                  <View style={globalStyles.WelcomeImageMargin}>
                    <Image 
                      resizeMode="contain"
                      source={require('../assets/img/empty/vacios-homebor-antena.png')}
                      style={globalStyles.imageNotInternet} />
                  </View>

                  <View style={globalStyles.WelcomeTextandBoton}>
                      <Heading size='sm'style={ globalStyles.tituloWelcome }>There is not internet connection.</Heading>
                      <Heading size='sm'style={ globalStyles.tituloWelcome }>Connect to the internet and try again.</Heading>   
                  </View>

                  
                  <View>
                      <Text onPress={this.state.connection_status ? this.onRefresh : this.tryAgainNotConnection} style={globalStyles.createaccount}> Try Again </Text>
                  </View>
                 
                </View>
              )}

              {this.state.connection_refreshStatus == false && (
                <View style={globalStyles.container}>
                  <View>
                    <Slide in={this.state.connection_status ? false : this.state.clockrun == false ? false : true} placement="top">
                      <AlertNativeBase style={globalStyles.StacknoInternetConnection}  justifyContent="center" status="error">
                        <VStack space={2} flexShrink={1} w="100%">
                          <HStack flexShrink={1} space={2}  justifyContent="center">
                              <Text color="error.600" fontWeight="medium">
                                <AlertNativeBase.Icon />
                                <Text> No Internet Connection</Text>
                              </Text>
                          </HStack>
                        </VStack>
                      </AlertNativeBase>
                    </Slide>

                    <FlatList
                      data={this.state.info}
                      extraData={this.state.info}
                      keyExtractor={item => `${item.info}`}
                      ListFooterComponent={() => this.state.loading ? <Spinner color="purple" style={ globalStyles.spinner2}/> : null}
                      nestedScrollEnabled={true}
                      bounces={false}
                      refreshControl={
                        <RefreshControl
                          enabled={true}
                          refreshing={this.state.refreshing}
                          onRefresh={this.onRefresh}
                          tintColor="purple"
                          colors={["purple","purple"]}/>}
                      renderItem={({item}) => (
                        <View>
                          <View style={globalStyles.marginTopRequiredFields}>
                              <Heading size='xl'style={ globalStyles.titulo }>House Gallery</Heading>
                          </View>

                          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {/*Frontage Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alerthome()}>
                                <Card style={globalStyles.shadowbox}>
                                    <Heading size='md' style={globalStyles.titlegalleryedit}> Frontage Photo </Heading>
                                    <Divider bg="gray.800"/>
                                          {imagehome == require('../assets/img/empty/vacios-homebor-casa.png') ?
                                          item.phome == "NULL" ?
                                          <Image source={imagehome}
                                          style={globalStyles.ImageGalleryedit} />
                                          :
                                          <Image source={this.state.phomePhoto}
                                          style={globalStyles.ImageGalleryedit} />
                                          :
                                          <Image source={{uri: imagehome}}
                                          style={globalStyles.ImageGalleryedit} />}
                                </Card>
                            </TouchableOpacity>

                            {/*Living Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertliving()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Living Room Photo </Heading>
                                <Divider bg="gray.800"/>
                                  {imageliving == require('../assets/img/empty/vacios-homebor-sala.png') ?
                                  item.pliving == "NULL" ?
                                  <Image source={imageliving}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.plivingPhoto}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imageliving}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>

                            {/*Family Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertfamily()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Family Picture </Heading>
                                <Divider bg="gray.800"/>
                                  {imagefamily == require('../assets/img/empty/vacios-homebor-familia.png') ?
                                  item.fp == "NULL" ?
                                  <Image source={imagefamily}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.fpPhoto}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagefamily}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>
                          </ScrollView>

                          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {/*Kitchen Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertkitchen()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Kitchen </Heading>
                                <Divider bg="gray.800"/>
                                  {imagekitchen == require('../assets/img/empty/vacios-homebor-cocina.png') ?
                                  item.parea1 == "NULL" ?
                                  <Image source={imagekitchen}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.parea1Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagekitchen}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>

                            {/*Dining Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertdining()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Dining Room</Heading>
                                <Divider bg="gray.800"/>
                                  {imagedining == require('../assets/img/empty/vacios-homebor-comedor.png') ?
                                  item.parea2 == "NULL" ?
                                  <Image source={imagedining}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.parea2Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagedining}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>

                            {/*House Area 3 Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertcommon1()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> House Area 3 </Heading>
                                <Divider bg="gray.800"/>
                                  {imagecommon1 == require('../assets/img/empty/vacios-homebor-areas-recreativas.png') ?
                                  item.parea3 == "NULL" ?
                                  <Image source={imagecommon1}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.parea3Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagecommon1}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>
  
                            {/*House Area 4 Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertcommon2()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> House Area 4 </Heading>
                                <Divider bg="gray.800"/>
                                  {imagecommon2 == require('../assets/img/empty/vacios-homebor-areas-recreativas.png') ?
                                  item.parea4 == "NULL" ?
                                  <Image source={imagecommon2}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.parea4Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagecommon2}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>

                          </ScrollView>

                          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            {/*Bathroom 1 Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertbath1()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Bathroom 1</Heading>
                                <Divider bg="gray.800"/>
                                  {imagebath1 == require('../assets/img/empty/vacios-homebor-bath.png') ?
                                  item.pbath1 == "NULL" ?
                                  <Image source={imagebath1}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.pbath1Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagebath1}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>
  
                            {/*Bathroom 2 Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertbath2()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Bathroom 2 </Heading>
                                <Divider bg="gray.800"/>
                                  {imagebath2 == require('../assets/img/empty/vacios-homebor-bath.png') ?
                                  item.pbath2 == "NULL" ?
                                  <Image source={imagebath2}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.pbath2Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagebath2}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>
  
                            {/*Bathroom 3 Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertbath3()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Bathroom 3 </Heading>
                                <Divider bg="gray.800"/>
                                  {imagebath3 == require('../assets/img/empty/vacios-homebor-bath.png') ?
                                  item.pbath3 == "NULL" ?
                                  <Image source={imagebath3}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={this.state.pbath3Photo}
                                  style={globalStyles.ImageGalleryedit} />
                                  :
                                  <Image source={{uri: imagebath3}}
                                  style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>
  
                            {/*Bathroom 4 Photo*/}
  
                            <TouchableOpacity onPress={()=>this._Alertbath4()}>
                              <Card style={globalStyles.shadowbox}>
                                <Heading size='md' style={globalStyles.titlegalleryedit}> Bathroom 4 </Heading>
                                <Divider bg="gray.800"/>
                                    {imagebath4 == require('../assets/img/empty/vacios-homebor-bath.png') ?
                                    item.pbath4 == "NULL" ?
                                    <Image source={imagebath4}
                                    style={globalStyles.ImageGalleryedit} />
                                    :
                                    <Image source={this.state.pbath4Photo}
                                    style={globalStyles.ImageGalleryedit} />
                                    :
                                    <Image source={{uri: imagebath4}}
                                    style={globalStyles.ImageGalleryedit} />}
                              </Card>
                            </TouchableOpacity>

                          </ScrollView>

                          <View style={ globalStyles.contenido}>
                              <View>
                                <Button
                                  success
                                  bordered
                                  onPress={this.state.connection_status ? this.registerbasici : this.noInternetConnection}
                                  style={globalStyles.botonedit}
                                  >

                                  <Text style={globalStyles.botonTexto}> Update </Text>
                                </Button>
                              </View>                  
                          </View>

                        </View>
                      )}/>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </NativeBaseProvider>
    )
  }
}