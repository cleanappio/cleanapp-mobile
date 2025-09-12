import CameraScreen from './CameraScreen';

const ReviewCameraScreen = ({route}: {route: {params: {report: any}}}) => {
  return <CameraScreen reportId={route.params.report.id} />;
};

export default ReviewCameraScreen;
