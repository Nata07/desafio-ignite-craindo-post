import { useEffect, useRef } from 'react';
import commonStyles from '../../styles/common.module.scss';

export default function PostComments(): JSX.Element {
  const commentBox = useRef(null);
  useEffect(() => {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://utteranc.es/client.js');
    scriptEl.setAttribute('crossorigin', 'anonymous');
    scriptEl.setAttribute('async', 'true');
    scriptEl.setAttribute('repo', 'hardzork/ignite-reactjs-desafio5');
    scriptEl.setAttribute('issue-term', 'pathname');
    scriptEl.setAttribute('theme', 'github-dark');
    commentBox.current.appendChild(scriptEl);
  }, []);
  return (
    <div className={commonStyles.container}>
      <h1>Comentários</h1>
      <hr />
      <div ref={commentBox} />
      {/* Above element is where the comments are injected */}
    </div>
  );
}
