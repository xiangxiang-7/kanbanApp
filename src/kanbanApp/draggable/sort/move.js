const indexOf = (arr, id) => {
  const item = arr.filter((a) => id === a.id)[0];
  return arr.indexOf(item);
};

// 排序算法
export default function move({
  sourceId,
  sourceContainerId,
  sourceContainerList,
  targetId,
  targetContainerId,
  targetContainerList,
}) {
  const sameContainer = sourceContainerId === targetContainerId;
  const differentContainer = sourceContainerId !== targetContainerId;

  // 同一容器 => splice souce +  push target
  if (sameContainer) {
    return moveWithinContainer(
      sourceId,
      targetId,
      sourceContainerList,
      targetContainerList,
    );
    // 不同容器 => container splice souce +  push target
  }

  if (differentContainer) {
    return moveOutsideContainer(
      sourceId,
      targetId,
      sourceContainerList,
      targetContainerList,
    );
  }
  return null;
}

// 同一容器 做排序
function moveWithinContainer(sourceId, targetId, sourceContainerList) {
  if (targetId) {
    const sourceIndex = indexOf(sourceContainerList, sourceId);
    const targetIndex = indexOf(sourceContainerList, targetId);
    const sourceData = sourceContainerList.splice(sourceIndex, 1)[0];
    sourceContainerList.splice(targetIndex, 0, sourceData);
  }

  return { sourceContainerList, targetContainerList: sourceContainerList };
}

// 不同容器 先splice 在进行push
function moveOutsideContainer(
  sourceId,
  targetId,
  sourceContainerList,
  targetContainerList,
) {
  const sourceIndex = indexOf(sourceContainerList, sourceId);
  const sourceData = sourceContainerList[sourceIndex];
  sourceContainerList.splice(sourceIndex, 1);

  if (targetId) {
    const targetIndex = indexOf(sourceContainerList, targetId);
    const targetData = sourceContainerList[targetIndex];
    targetContainerList.splice(targetIndex, 0, targetData);
  } else {
    targetContainerList.push(sourceData);
  }

  return { sourceContainerList, targetContainerList };
}
