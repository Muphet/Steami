'use strict';

import React from 'react'
import AchievementsPresentationContainer from './AchievementsPresentationContainer.jsx'
import fetch from 'node-fetch'

export default class AchievementsDataContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playerCompletedAchievements: [],
      playerOutstandingAchievements: [],
      gameHasAchievements: true
    };
  }

  setAchievementsState(mergedAchArray) {
      let completedArray = mergedAchArray.filter(function(ach) {
        return ach.achieved == 1
      });
      let outstandingArray = mergedAchArray.filter(function(ach) {
        return ach.achieved == 0
      });
      this.setState({ playerCompletedAchievements: completedArray, playerOutstandingAchievements: outstandingArray })
  }

  componentDidMount() {
    let gameAchArray = [];
    let playerAchArray = [];
    fetch(`http://localhost:3000/steam/games/${this.props.gameId}/schema`)
      .then(res => {
        return res.json() })
          .then(json => {
            if(json.game.hasOwnProperty('availableGameStats')) {
              gameAchArray = json.game.availableGameStats.achievements
            }
            fetch(`http://localhost:3000/steam/player/achievements/${this.props.gameId}`)
              .then(res => {
                return res.json() })
                  .then(json => {
                    if(json.playerstats.hasOwnProperty('achievements')){
                      playerAchArray = json.playerstats.achievements
                    }
                    console.log('gameachievements populated?');
                    console.log(gameAchArray.length != 0)
                    console.log('playerachsievements populated?');
                    console.log(playerAchArray.length != 0)
                    if (gameAchArray.length != 0 && playerAchArray.length != 0) {
                      console.log('ABOUT TO RUN build of achievements arrays')
                      gameAchArray = gameAchArray.sort(this.compareObjects);
                      playerAchArray = playerAchArray.sort(this.compareObjects);
                      console.log('sorted gameachArry is ', gameAchArray);
                      console.log('sorted playerAchArray is ', playerAchArray);
                      let mergedAchArray = playerAchArray.map(
                        function(playerAch, i) {
                          let gameAch = gameAchArray[i]
                          return Object.assign(gameAch, playerAch);
                        }
                      );
                      this.setAchievementsState(mergedAchArray);
                    } else {
                      this.setState({ gameHasAchievements: false });
                    }
                  });
          });
  }

  compareObjects(a,b) {
    let field = 'apiname'
    if (a.hasOwnProperty('name')) {
      field = 'name';
    }
    if (a[field] < b[field]) {
      return -1;
    }
    if (a[field] > b[field]) {
      return 1;
    }
    return 0;
  }

  render() {
    console.log(this.state.playerCompletedAchievements);
    console.log(this.state.playerOutstandingAchievements);
    return (
      <AchievementsPresentationContainer playerCompletedAchievements={this.state.playerCompletedAchievements} playerOutstandingAchievements={this.state.playerOutstandingAchievements} gameHasAchievements={this.state.gameHasAchievements} />
    );
  }
}
