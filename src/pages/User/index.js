import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { PacmanIndicator } from 'react-native-indicators';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('user').name,
  });

  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    stars: [],
    loading: true,
    refreshing: false,
    page: 2,
  };

  async componentDidMount() {
    this.loadStarreds();
  }

  loadStarreds = async (page = 1) => {
    const { stars } = this.state;
    const { navigation } = this.props;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: { page },
    });

    this.setState({
      stars: page >= 2 ? [...stars, ...response.data] : response.data,
      page,
      loading: false,
      refreshing: false,
    });
  };

  loadMore = () => {
    const { page } = this.state;

    const nextPage = page + 1;

    this.loadStarreds(nextPage);
  };

  refreshList = () => {
    this.setState({ refreshing: true, stars: [] }, this.load);
  };

  renderFooter = () => {
    const { loading } = this.state;

    if (!loading) return null;

    return <PacmanIndicator color="black" />;
  };

  render() {
    const { navigation } = this.props;
    const { stars, loading, refreshing } = this.state;
    const user = navigation.getParam('user');

    if (loading) {
      return <PacmanIndicator color="black" />;
    }

    return (
      <Container>
        <Header>
          <Avatar source={{ uri: user.avatar }} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        <Stars
          data={stars}
          onRefresh={this.refreshList}
          refreshing={refreshing}
          onEndReachedThreshold={0.2}
          onEndReached={this.loadMore} // Restante das props
          keyExtractor={star => String(star.id)}
          renderItem={({ item }) => (
            <Starred>
              <OwnerAvatar source={{ uri: item.owner.avatar_url }} />
              <Info>
                <Title>{item.name}</Title>
                <Author>{item.owner.login}</Author>
              </Info>
            </Starred>
          )}
        />
      </Container>
    );
  }
}
