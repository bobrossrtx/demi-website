import { Component } from "react";

interface Page {
    title:       string;
    showTitle:   string;
    description: string;
    page:        string;
    tags:        string[];
    category:    string;
    order:       number;
    catid:       number;
}    

export interface IProps {
    click: boolean
    handleClick: () => void
    categories: string[]
    jsonData: Page[]
}



class DocSideBar extends Component<IProps> {

    render() {
        return (
           <>
               <div className='sidebar-menu-icon' onClick={this.props.handleClick}>
                        {this.props.click ? (<img className="chevron" src="/static/images/chevleft.svg" alt="Chevron Left" title="chevleft" />) : (<img className="chevron" src="/static/images/chevright.svg" alt="Chevron Right" title="chevright" />)}
                    </div>
                    <div className={this.props.click ? 'documentation-page-sidebar sidebar-large' : 'documentation-page-sidebar'}>
                        {this.props.categories.map(category => (
                            <>
                            <h4>{category}</h4>
                            <ul>
                                {this.props.jsonData.map(page => {
                                    if (page.category === category) return (
                                        <a href={"../docs?page="+page.page}>
                                            <li>
                                                <p className='document-page-sidebar-item'>{page.showTitle}</p>
                                            </li>
                                        </a>
                                    )
                                    return <></>
                                })}
                            </ul>
                            </>
                        ))}
                    </div>
           </>
        );
    }
}

export default DocSideBar;