import React from "react";
import Card from "./Card";

export default function MarketplaceList(props) {
  var appList = [];
  if (props.appData) {
    appList = props.appData.map((app) => (
      <Card
        id={app.id}
        avatar={app.avatar}
        title={app.title}
        vendor={app.vendor}
        description={app.description}
        status={app.status}
      />
    ));
  }

  return <div>{appList}</div>;
}
